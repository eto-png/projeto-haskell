export const LANGUAGES = [
  "HTML",
  "CSS",
  "JavaScript",
  "TypeScript",
  "Python",
  "Haskell",
  "Git",
  "Bash / Terminal",
  "SQL",
  "Rust",
  "C / C++",
  "Outra",
] as const;
export type Snippet = { id: number; titulo: string; linguagem: string; codigo: string };
export type VaultSession = {
  token: string;
  usuario: { id: number; nome: string; email: string };
  demo?: boolean;
};
export const languageClass = (language: string) =>
  `language-${LANGUAGES.indexOf(language as (typeof LANGUAGES)[number]) < 0 ? 11 : LANGUAGES.indexOf(language as (typeof LANGUAGES)[number])}`;
export function filterSnippets(snippets: Snippet[], query: string, language: string) {
  const q = query.trim().toLocaleLowerCase();
  return snippets.filter(
    (s) =>
      (language === "Todas" || s.linguagem === language) &&
      `${s.titulo}\n${s.codigo}`.toLocaleLowerCase().includes(q),
  );
}
export const EXAMPLES: Snippet[] = [
  {
    id: 1,
    titulo: "Desfazer o último commit",
    linguagem: "Git",
    codigo:
      "# Desfaz o commit, mantendo as alterações\ngit reset --soft HEAD~1\n\n# Confira o estado do repositório\ngit status",
  },
  {
    id: 2,
    titulo: "Debounce de uma função",
    linguagem: "JavaScript",
    codigo:
      "const debounce = (fn, delay = 300) => {\n  let timeout;\n  return (...args) => {\n    clearTimeout(timeout);\n    timeout = setTimeout(() => fn(...args), delay);\n  };\n};",
  },
  {
    id: 3,
    titulo: "Tipar uma resposta da API",
    linguagem: "TypeScript",
    codigo:
      "type ApiResponse<T> = {\n  data: T;\n  success: boolean;\n  message?: string;\n};\n\nconst response: ApiResponse<User[]> = await fetchUsers();",
  },
  {
    id: 4,
    titulo: "Criar um ambiente virtual",
    linguagem: "Python",
    codigo:
      "# Crie e ative o ambiente\npython -m venv .venv\nsource .venv/bin/activate\n\n# Instale as dependências\npip install -r requirements.txt",
  },
  {
    id: 5,
    titulo: "Grid responsivo sem media queries",
    linguagem: "CSS",
    codigo:
      ".grid {\n  display: grid;\n  grid-template-columns:\n    repeat(auto-fit, minmax(280px, 1fr));\n  gap: 1.5rem;\n  align-items: start;\n}",
  },
  {
    id: 6,
    titulo: "Encontrar processos em uma porta",
    linguagem: "Bash / Terminal",
    codigo:
      "# Liste processos usando a porta 8080\nlsof -i :8080\n\n# Veja os detalhes de um processo\nps -p <PID> -o pid,command",
  },
  {
    id: 7,
    titulo: "Consultar registros duplicados",
    linguagem: "SQL",
    codigo:
      "SELECT email, COUNT(*) AS total\nFROM usuarios\nGROUP BY email\nHAVING COUNT(*) > 1\nORDER BY total DESC;",
  },
  {
    id: 8,
    titulo: "Endpoint com Servant",
    linguagem: "Haskell",
    codigo:
      'type API = "health" :> Get \'[JSON] Text\n\nserver :: Server API\nserver = pure "ok"\n\napp :: Application\napp = serve (Proxy :: Proxy API) server',
  },
  {
    id: 9,
    titulo: "Estrutura HTML semântica",
    linguagem: "HTML",
    codigo:
      "<main>\n  <article>\n    <header>\n      <h1>Meu próximo projeto</h1>\n    </header>\n    <p>Uma ideia de cada vez.</p>\n  </article>\n</main>",
  },
];
