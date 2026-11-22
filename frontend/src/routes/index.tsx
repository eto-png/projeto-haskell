import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Vault } from "@/components/devvault/Vault";
import { readSession, snippetsQuery } from "@/lib/devvault-api";
export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Meu cofre de snippets — DevVault" },
      {
        name: "description",
        content: "Organize, encontre e copie seus snippets e comandos de terminal no DevVault.",
      },
      { property: "og:title", content: "Meu cofre de snippets — DevVault" },
      {
        property: "og:description",
        content: "Seu acervo pessoal de código e comandos, sempre à mão.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  beforeLoad: () => {
    if (!readSession()) throw redirect({ to: "/auth" });
  },
  loader: ({ context }) => context.queryClient.ensureQueryData(snippetsQuery()),
  component: Vault,
  pendingComponent: () => (
    <div className="flex min-h-screen items-center justify-center font-mono text-sm text-muted-foreground">
      Abrindo seu cofre...
    </div>
  ),
  errorComponent: ({ error, reset }) => (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-5 px-6 text-center">
      <h1 className="text-xl font-semibold">Não foi possível abrir o cofre</h1>
      <p className="text-sm text-muted-foreground">
        {error instanceof Error ? error.message : "Não foi possível conectar à API."}
      </p>
      <div className="flex gap-3">
        <Button onClick={reset}>Tentar novamente</Button>
        <Button variant="outline" asChild>
          <Link to="/auth">Voltar para entrar</Link>
        </Button>
      </div>
    </div>
  ),
});
