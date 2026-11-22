import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import {
  Braces,
  ChevronDown,
  Code2,
  FolderCode,
  LogOut,
  Plus,
  Search,
  Terminal,
  X,
  Loader2,
  HardDrive,
  ArrowUpRight,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { LANGUAGES, filterSnippets, languageClass, type Snippet } from "@/lib/vault";
import { apiUrl, deleteSnippet, readSession, signOut, snippetsQuery } from "@/lib/devvault-api";
import { Brand } from "./Brand";
import { ApiConfig } from "./ApiConfig";
import { SnippetCard } from "./SnippetCard";
import { NewSnippet } from "./NewSnippet";
export function Vault() {
  const session = readSession();
  const { data: snippets } = useSuspenseQuery(snippetsQuery());
  const client = useQueryClient();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [language, setLanguage] = useState("Todas");
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState<Snippet | null>(null);
  const [busy, setBusy] = useState(false);
  const filtered = filterSnippets(snippets, query, language);
  const used = LANGUAGES.filter((l) => snippets.some((s) => s.linguagem === l));
  const refresh = async () => {
    await client.invalidateQueries({ queryKey: ["devvault"] });
  };
  return (
    <div className="vault-layout min-h-screen">
      <aside className="vault-sidebar">
        <div className="px-6 pb-9 pt-7">
          <Brand />
        </div>
        <div className="px-4">
          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Workspace
          </p>
          <Button
            variant="ghost"
            onClick={() => {
              setLanguage("Todas");
              setQuery("");
            }}
            className={`sidebar-link w-full justify-start ${language === "Todas" ? "sidebar-active" : ""}`}
          >
            <FolderCode />
            Todos os snippets<span className="ml-auto text-xs opacity-60">{snippets.length}</span>
          </Button>
          <div className="mb-3 mt-8 flex items-center justify-between px-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Linguagens
            </p>
            <Code2 size={13} className="text-muted-foreground" />
          </div>
          <nav aria-label="Filtrar por linguagem" className="space-y-1">
            {used.map((l) => (
              <Button
                key={l}
                variant="ghost"
                className={`sidebar-link w-full justify-start ${languageClass(l)} ${language === l ? "sidebar-active" : ""}`}
                onClick={() => setLanguage(l)}
              >
                <span className="language-dot" />
                {l === "Bash / Terminal" ? "Bash / Terminal" : l}
                <span className="ml-auto text-xs text-muted-foreground">
                  {snippets.filter((s) => s.linguagem === l).length}
                </span>
              </Button>
            ))}
          </nav>
        </div>
        <div className="mt-auto border-t px-6 py-5">
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            {session?.demo ? "Workspace local" : "API conectada"}
          </p>
          <p className="mt-2 font-mono text-[10px] text-muted-foreground">devvault / v.0.1.0</p>
        </div>
      </aside>
      <div className="vault-main min-w-0">
        <header className="vault-header flex min-h-20 flex-wrap items-center justify-between gap-4 border-b px-8">
          <div className="mobile-brand">
            <Brand />
          </div>
          <div className="desktop-breadcrumb flex items-center gap-2 text-xs text-muted-foreground">
            <FolderCode size={15} />
            <span>Meu workspace</span>
            <span className="mx-1 opacity-50">/</span>
            <span className="text-foreground">Snippets</span>
          </div>
          <div className="flex items-center gap-4">
            <ApiConfig />
            <div className="h-6 border-l" />
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-primary/25 bg-primary/10 text-xs font-semibold text-primary">
                {session?.usuario.nome.slice(0, 2).toUpperCase()}
              </span>
              <span className="user-name max-w-28 truncate text-xs font-medium">
                {session?.usuario.nome}
              </span>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Sair"
                title="Sair"
                className="text-muted-foreground"
                onClick={async () => {
                  signOut();
                  client.clear();
                  await navigate({ to: "/auth" });
                }}
              >
                <LogOut />
              </Button>
            </div>
          </div>
        </header>
        <main className="vault-content px-8 py-9">
          <div className="mb-8 flex flex-wrap items-start justify-between gap-5">
            <div>
              <p className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-primary">
                <Braces size={13} />
                Seu acervo de código
              </p>
              <h1 className="text-3xl font-bold">
                Meu cofre de snippets
                <span className="ml-3 align-middle font-mono text-sm font-normal text-muted-foreground">
                  {snippets.length.toString().padStart(2, "0")}
                </span>
              </h1>
              <p className="mt-3 text-sm text-muted-foreground">
                Boas soluções merecem ser guardadas.
              </p>
            </div>
            <Button className="mt-1" onClick={() => setOpen(true)}>
              <Plus />
              Novo snippet
            </Button>
          </div>
          <div className="vault-toolbar mb-6 flex flex-wrap items-center gap-3">
            <div className="relative min-w-0 flex-1">
              <Search size={16} className="absolute left-3.5 top-3 text-muted-foreground" />
              <Input
                aria-label="Buscar snippets"
                className="h-10 bg-card pl-10 pr-9 text-sm"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por título ou código..."
              />
              {query && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-0.5 h-9 w-8 text-muted-foreground"
                  aria-label="Limpar busca"
                  onClick={() => setQuery("")}
                >
                  <X size={14} />
                </Button>
              )}
            </div>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="h-10 w-48 bg-card" aria-label="Filtrar linguagem">
                <div className="flex min-w-0 items-center gap-2">
                  <Code2 size={15} />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todas">Todas as linguagens</SelectItem>
                {LANGUAGES.map((l) => (
                  <SelectItem key={l} value={l}>
                    <span className={`flex items-center gap-2 ${languageClass(l)}`}>
                      <span className="language-dot" />
                      {l}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="mb-4 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>
              {filtered.length} {filtered.length === 1 ? "snippet" : "snippets"}
              {language !== "Todas" ? ` · ${language}` : " no seu cofre"}
            </span>
            <span className="flex items-center gap-1.5">
              Ordem de criação
              <ChevronDown size={12} />
            </span>
          </div>
          {filtered.length ? (
            <div className="snippet-grid grid gap-5">
              {filtered.map((s) => (
                <SnippetCard key={s.id} snippet={s} onDelete={() => setDeleting(s)} />
              ))}
            </div>
          ) : (
            <div className="flex min-h-96 flex-col items-center justify-center text-center">
              <svg
                viewBox="0 0 180 140"
                className="mb-6 h-32 w-44 text-muted-foreground"
                fill="none"
                aria-hidden="true"
              >
                <rect
                  x="25"
                  y="25"
                  width="130"
                  height="90"
                  rx="8"
                  className="fill-card stroke-border"
                />
                <path
                  d="M25 45h130M40 35h3m6 0h3m6 0h3"
                  className="stroke-border"
                  strokeWidth="2"
                />
                <path
                  d="m70 65-13 15 13 15m40-30 13 15-13 15m-13-35-12 40"
                  className="stroke-primary"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
              <h2 className="text-lg font-semibold">
                {snippets.length ? "Nenhum snippet encontrado" : "Seu cofre começa aqui"}
              </h2>
              <p className="mb-6 mt-2 max-w-sm text-sm text-muted-foreground">
                {snippets.length
                  ? "Tente outra busca ou escolha uma linguagem diferente."
                  : "Um comando útil, uma função favorita. Guarde sua primeira solução."}
              </p>
              <Button
                onClick={() => {
                  if (snippets.length) {
                    setQuery("");
                    setLanguage("Todas");
                  } else setOpen(true);
                }}
              >
                {snippets.length ? <X /> : <Plus />}
                {snippets.length ? "Limpar filtros" : "Criar primeiro snippet"}
              </Button>
            </div>
          )}
          <footer className="mt-9 flex flex-wrap items-center justify-between gap-2 border-t pt-5 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-2">
              <HardDrive size={13} />
              {session?.demo
                ? "Demonstração · Exemplos salvos neste navegador"
                : new URL(apiUrl()).host}
            </span>
            <span className="flex items-center gap-1.5">
              Feito para quem constrói
              <ArrowUpRight size={12} />
            </span>
          </footer>
        </main>
      </div>
      <NewSnippet open={open} onOpenChange={setOpen} onSaved={refresh} />
      <AlertDialog
        open={!!deleting}
        onOpenChange={(o) => {
          if (!o && !busy) setDeleting(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir este snippet?</AlertDialogTitle>
            <AlertDialogDescription>
              “{deleting?.titulo}” será removido do seu cofre. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={busy}
              onClick={async (e) => {
                e.preventDefault();
                if (!deleting) return;
                setBusy(true);
                try {
                  await deleteSnippet(deleting.id);
                  await refresh();
                  setDeleting(null);
                  toast.success("Snippet excluído.");
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : "Não foi possível excluir.");
                } finally {
                  setBusy(false);
                }
              }}
            >
              {busy && <Loader2 className="animate-spin" />}Excluir snippet
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
