import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Code2, Loader2, LockKeyhole } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brand } from "@/components/devvault/Brand";
import { ApiConfig } from "@/components/devvault/ApiConfig";
import { authenticate, enterDemo } from "@/lib/devvault-api";
export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar no cofre — DevVault" },
      {
        name: "description",
        content: "Entre ou crie sua conta para organizar seus snippets no DevVault.",
      },
      { property: "og:title", content: "Entrar no cofre — DevVault" },
      { property: "og:description", content: "Seu código, organizado e sempre à mão." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Auth,
});
function Auth() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  return (
    <div className="auth-page min-h-screen">
      <header className="flex items-center justify-between gap-3 border-b px-5 py-5 sm:px-10">
        <Brand />
        <ApiConfig />
      </header>
      <main className="mx-auto flex max-w-md flex-col px-5 py-16 sm:py-24">
        <div className="mb-8 self-center rounded-xl border border-primary/25 bg-primary/10 p-4 text-primary">
          <LockKeyhole size={30} />
        </div>
        <h1 className="text-center text-3xl font-bold">Seu código. Seu cofre.</h1>
        <p className="mt-3 text-center text-sm text-muted-foreground">
          Menos tempo procurando. Mais tempo criando.
        </p>
        <div className="mt-8 rounded-lg border bg-card p-6">
          <Tabs
            value={mode}
            onValueChange={(v) => {
              setMode(v === "register" ? "register" : "login");
              setError("");
            }}
          >
            <TabsList className="mb-6 grid w-full grid-cols-2">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="register">Criar conta</TabsTrigger>
            </TabsList>
          </Tabs>
          <form
            className="space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              setError("");
              const form = new FormData(e.currentTarget);
              try {
                await authenticate(mode, {
                  email: String(form.get("email")),
                  senha: String(form.get("senha")),
                  ...(mode === "register" ? { nome: String(form.get("nome")) } : {}),
                });
                toast.success(mode === "login" ? "Bem-vindo ao seu cofre!" : "Conta criada!");
                await navigate({ to: "/" });
              } catch (err) {
                setError(err instanceof Error ? err.message : "Não foi possível entrar.");
              } finally {
                setBusy(false);
              }
            }}
          >
            {mode === "register" && (
              <label className="block space-y-2 text-sm">
                Nome
                <Input
                  name="nome"
                  autoComplete="name"
                  required
                  placeholder="Seu nome"
                  maxLength={100}
                />
              </label>
            )}
            <label className="block space-y-2 text-sm">
              E-mail
              <Input
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="voce@exemplo.com"
              />
            </label>
            <label className="block space-y-2 text-sm">
              Senha
              <Input
                name="senha"
                type="password"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                required
                placeholder="Sua senha"
              />
            </label>
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
            <Button className="w-full" disabled={busy}>
              {busy ? <Loader2 className="animate-spin" /> : <ArrowRight />}
              {mode === "login" ? "Entrar no DevVault" : "Criar minha conta"}
            </Button>
          </form>
        </div>
        <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          OU
          <span className="h-px flex-1 bg-border" />
        </div>
        <Button
          variant="outline"
          onClick={async () => {
            enterDemo();
            await navigate({ to: "/" });
          }}
        >
          <Code2 />
          Explorar demonstração
          <ArrowRight />
        </Button>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Dados de exemplo · Sem conta · Salvos neste navegador
        </p>
      </main>
    </div>
  );
}
