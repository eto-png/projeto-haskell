{-# LANGUAGE DataKinds #-}
{-# LANGUAGE DeriveGeneric #-}
{-# LANGUAGE OverloadedStrings #-}
{-# LANGUAGE TypeOperators #-}

module Main where

import Control.Concurrent.MVar (MVar, modifyMVar, newMVar, readMVar)
import Control.Monad.IO.Class (liftIO)
import Data.Aeson (FromJSON (..), ToJSON (..), decodeFileStrict, encodeFile, object, withObject, (.:), (.:?), (.=))
import Data.List (find)
import Data.Maybe (fromMaybe)
import Data.Text (Text)
import qualified Data.Text as T
import GHC.Generics (Generic)
import Network.HTTP.Types (methodDelete, methodGet, methodOptions, methodPost, methodPut)
import Network.Wai (Middleware)
import Network.Wai.Handler.Warp (run)
import Network.Wai.Middleware.Cors (CorsResourcePolicy (..), cors, simpleCorsResourcePolicy)
import Servant
import System.Directory (doesFileExist, renameFile)

-- ==========================
-- Modelos de Dados (JSON)
-- ==========================

data UsuarioPublico = UsuarioPublico
  { id :: Int
  , nome :: Text
  , email :: Text
  }
  deriving (Show, Generic)

instance ToJSON UsuarioPublico
instance FromJSON UsuarioPublico

data UsuarioInterno = UsuarioInterno
  { uId :: Int
  , uNome :: Text
  , uEmail :: Text
  , uSenha :: Text
  , uToken :: Text
  }
  deriving (Show, Generic)

instance ToJSON UsuarioInterno
instance FromJSON UsuarioInterno

data RegisterReq = RegisterReq
  { regEmail :: Text
  , regSenha :: Text
  , regNome :: Maybe Text
  }
  deriving (Show, Generic)

instance FromJSON RegisterReq where
  parseJSON = withObject "RegisterReq" $ \v ->
    RegisterReq
      <$> v .: "email"
      <*> v .: "senha"
      <*> v .:? "nome"

data LoginReq = LoginReq
  { logEmail :: Text
  , logSenha :: Text
  }
  deriving (Show, Generic)

instance FromJSON LoginReq where
  parseJSON = withObject "LoginReq" $ \v ->
    LoginReq
      <$> v .: "email"
      <*> v .: "senha"

data AuthResp = AuthResp
  { token :: Text
  , usuario :: UsuarioPublico
  }
  deriving (Show, Generic)

instance ToJSON AuthResp

data Snippet = Snippet
  { sId :: Int
  , sUserId :: Int
  , titulo :: Text
  , linguagem :: Text
  , codigo :: Text
  }
  deriving (Show, Generic)

instance ToJSON Snippet where
  toJSON s =
    object
      [ "id" .= sId s
      , "sUserId" .= sUserId s
      , "titulo" .= titulo s
      , "linguagem" .= linguagem s
      , "codigo" .= codigo s
      ]

instance FromJSON Snippet where
  parseJSON = withObject "Snippet" $ \v -> do
    sid <- v .: "id"
    uid <- fromMaybe 1 <$> (v .:? "sUserId")
    tit <- v .: "titulo"
    ling <- v .: "linguagem"
    cod <- v .: "codigo"
    pure (Snippet sid uid tit ling cod)

data CreateSnippetReq = CreateSnippetReq
  { reqTitulo :: Text
  , reqLinguagem :: Text
  , reqCodigo :: Text
  }
  deriving (Show, Generic)

instance FromJSON CreateSnippetReq where
  parseJSON = withObject "CreateSnippetReq" $ \v ->
    CreateSnippetReq
      <$> v .: "titulo"
      <*> v .: "linguagem"
      <*> v .: "codigo"

data Database = Database
  { dbUsuarios :: [UsuarioInterno]
  , dbSnippets :: [Snippet]
  }
  deriving (Show, Generic)

instance ToJSON Database
instance FromJSON Database

-- ==========================
-- Persistência em Arquivo
-- ==========================

dbFile :: FilePath
dbFile = "devvault-db.json"

loadDB :: IO Database
loadDB = do
  exists <- doesFileExist dbFile
  if not exists
    then pure (Database [] [])
    else do
      mDb <- decodeFileStrict dbFile
      case mDb of
        Nothing -> do
          putStrLn "AVISO: Falha ao ler devvault-db.json!"
          pure (Database [] [])
        Just db -> do
          putStrLn $ "Banco carregado: " <> show (length (dbUsuarios db)) <> " usuario(s), " <> show (length (dbSnippets db)) <> " snippet(s)."
          pure db

saveDB :: Database -> IO ()
saveDB db = do
  let tmpFile = dbFile <> ".tmp"
  encodeFile tmpFile db
  renameFile tmpFile dbFile

-- ==========================
-- Definição da API Servant
-- ==========================

type API =
       "hello" :> Get '[JSON] Text
  :<|> "register" :> ReqBody '[JSON] RegisterReq :> Post '[JSON] AuthResp
  :<|> "login" :> ReqBody '[JSON] LoginReq :> Post '[JSON] AuthResp
  :<|> "snippets" :> Header "Authorization" Text :> Get '[JSON] [Snippet]
  :<|> "snippets" :> Header "Authorization" Text :> ReqBody '[JSON] CreateSnippetReq :> Post '[JSON] Snippet
  :<|> "snippets" :> Header "Authorization" Text :> Capture "id" Int :> Delete '[JSON] Text

-- ==========================
-- Autenticação Auxiliar
-- ==========================

extractUser :: Maybe Text -> Database -> Maybe UsuarioInterno
extractUser Nothing _ = Nothing
extractUser (Just authHeader) db =
  let tok = T.strip $ fromMaybe authHeader (T.stripPrefix "Bearer " authHeader)
   in find (\u -> uToken u == tok) (dbUsuarios db)

-- ==========================
-- Handlers (Regras)
-- ==========================

server :: MVar Database -> Server API
server dbVar =
       helloHandler
  :<|> registerHandler dbVar
  :<|> loginHandler dbVar
  :<|> listSnippetsHandler dbVar
  :<|> createSnippetHandler dbVar
  :<|> deleteSnippetHandler dbVar

helloHandler :: Handler Text
helloHandler = pure "DevVault API online!"

registerHandler :: MVar Database -> RegisterReq -> Handler AuthResp
registerHandler dbVar req = do
  let emailClean = T.toLower (T.strip (regEmail req))
  let nomeClean = fromMaybe "Dev" (regNome req)
  res <- liftIO $ modifyMVar dbVar $ \db ->
    case find (\u -> uEmail u == emailClean) (dbUsuarios db) of
      Just _ -> pure (db, Left err409)
      Nothing -> do
        let nextId = maximum (0 : map uId (dbUsuarios db)) + 1
        let tok = "token-" <> T.pack (show nextId) <> "-" <> emailClean
        let novoUser = UsuarioInterno nextId nomeClean emailClean (regSenha req) tok
        let newDb = db { dbUsuarios = novoUser : dbUsuarios db }
        saveDB newDb
        pure (newDb, Right (AuthResp tok (UsuarioPublico nextId nomeClean emailClean)))
  case res of
    Left err -> throwError err
    Right resp -> pure resp

loginHandler :: MVar Database -> LoginReq -> Handler AuthResp
loginHandler dbVar req = do
  let emailClean = T.toLower (T.strip (logEmail req))
  db <- liftIO $ readMVar dbVar
  case find (\u -> uEmail u == emailClean && uSenha u == logSenha req) (dbUsuarios db) of
    Nothing -> throwError err401
    Just u ->
      pure $ AuthResp (uToken u) (UsuarioPublico (uId u) (uNome u) (uEmail u))

listSnippetsHandler :: MVar Database -> Maybe Text -> Handler [Snippet]
listSnippetsHandler dbVar mAuth = do
  db <- liftIO $ readMVar dbVar
  case extractUser mAuth db of
    Nothing -> throwError err401
    Just u -> pure $ filter (\s -> sUserId s == uId u) (dbSnippets db)

createSnippetHandler :: MVar Database -> Maybe Text -> CreateSnippetReq -> Handler Snippet
createSnippetHandler dbVar mAuth req = do
  res <- liftIO $ modifyMVar dbVar $ \db ->
    case extractUser mAuth db of
      Nothing -> pure (db, Left err401)
      Just u -> do
        let nextId = maximum (0 : map sId (dbSnippets db)) + 1
        let novo =
              Snippet
                { sId = nextId
                , sUserId = uId u
                , titulo = reqTitulo req
                , linguagem = reqLinguagem req
                , codigo = reqCodigo req
                }
        let newDb = db { dbSnippets = novo : dbSnippets db }
        saveDB newDb
        pure (newDb, Right novo)
  case res of
    Left err -> throwError err
    Right snip -> pure snip

deleteSnippetHandler :: MVar Database -> Maybe Text -> Int -> Handler Text
deleteSnippetHandler dbVar mAuth targetId = do
  res <- liftIO $ modifyMVar dbVar $ \db ->
    case extractUser mAuth db of
      Nothing -> pure (db, Left err401)
      Just u -> do
        let filtrados = filter (\s -> not (sId s == targetId && sUserId s == uId u)) (dbSnippets db)
        let newDb = db { dbSnippets = filtrados }
        saveDB newDb
        pure (newDb, Right "Snippet excluido")
  case res of
    Left err -> throwError err
    Right ok -> pure ok

-- ==========================
-- CORS e Inicialização
-- ==========================

corsMiddleware :: Middleware
corsMiddleware = cors $ const $ Just simpleCorsResourcePolicy
  { corsOrigins = Nothing
  , corsMethods = [methodGet, methodPost, methodPut, methodDelete, methodOptions]
  , corsRequestHeaders = ["Content-Type", "Authorization"]
  }

app :: MVar Database -> Application
app dbVar = corsMiddleware $ serve (Proxy :: Proxy API) (server dbVar)

main :: IO ()
main = do
  initialDb <- loadDB
  dbVar <- newMVar initialDb
  putStrLn "DevVault Backend rodando na porta 8080..."
  run 8080 (app dbVar)