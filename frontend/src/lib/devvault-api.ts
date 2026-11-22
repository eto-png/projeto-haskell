import { queryOptions } from "@tanstack/react-query";
import { EXAMPLES, type Snippet, type VaultSession } from "./vault";

const CONFIG_KEY = "devvault.api";
const SESSION_KEY = "devvault.session";
const DEMO_KEY = "devvault.examples";
const DEFAULT_API_URL = "https://codespaces-4a511b-8080.app.github.dev";

export function apiUrl() {
  return (
    localStorage.getItem(CONFIG_KEY) ||
    (import.meta.env["VITE_API_URL"] as string | undefined) ||
    DEFAULT_API_URL
  );
}

export function normalizeApiUrl(value: string) {
  if (!value.trim()) return "";
  const url = new URL(value.trim());
  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.search ||
    url.hash
  )
    throw new Error("Informe uma URL HTTP ou HTTPS válida, sem credenciais ou parâmetros.");
  return url.toString().replace(/\/$/, "");
}

export function configureApi(value: string) {
  const url = normalizeApiUrl(value);
  localStorage.setItem(CONFIG_KEY, url);
  signOut();
}

export function readSession(): VaultSession | null {
  try {
    const saved = JSON.parse(localStorage.getItem(SESSION_KEY) ?? "null");
    return saved?.base === apiUrl() && saved?.session?.token ? saved.session : null;
  } catch {
    return null;
  }
}

function saveSession(session: VaultSession) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ base: apiUrl(), session }));
  return session;
}

export function signOut() {
  localStorage.removeItem(SESSION_KEY);
}

export function enterDemo() {
  return saveSession({
    token: "local-demo",
    usuario: { id: 0, nome: "Alex", email: "demo@example.com" },
    demo: true,
  });
}

async function request<T>(path: string, init: RequestInit = {}, authenticated = true): Promise<T> {
  const base = apiUrl();
  if (!base) throw new Error("Configure a URL da API para entrar ou criar sua conta.");
  const session = readSession();
  try {
    const res = await fetch(`${base}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(authenticated && session && !session.demo
          ? { Authorization: `Bearer ${session.token}` }
          : {}),
        ...init.headers,
      },
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) {
      if (res.status === 401) {
        if (authenticated) signOut();
        throw new Error(
          authenticated ? "Sua sessão expirou. Entre novamente." : "E-mail ou senha inválidos.",
        );
      }
      if (res.status === 409) throw new Error("Este e-mail já está cadastrado.");
      throw new Error("A API não conseguiu concluir a solicitação. Tente novamente.");
    }
    return res.status === 204 ? (undefined as T) : ((await res.json()) as T);
  } catch (error) {
    if (
      error instanceof TypeError ||
      (error instanceof DOMException && error.name === "TimeoutError")
    )
      throw new Error(
        "Não foi possível conectar à API. Verifique a URL, o servidor e a permissão de CORS.",
      );
    throw error;
  }
}

export async function authenticate(
  mode: "login" | "register",
  data: { email: string; senha: string; nome?: string },
) {
  const session = await request<VaultSession>(
    `/${mode}`,
    { method: "POST", body: JSON.stringify(data) },
    false,
  );
  if (!session.token || !session.usuario?.nome)
    throw new Error("A API retornou uma resposta de autenticação inválida.");
  return saveSession(session);
}

function demoSnippets(): Snippet[] {
  try {
    return JSON.parse(localStorage.getItem(DEMO_KEY) ?? "null") ?? EXAMPLES;
  } catch {
    return EXAMPLES;
  }
}

export async function listSnippets(): Promise<Snippet[]> {
  return readSession()?.demo ? demoSnippets() : request<Snippet[]>("/snippets");
}

export async function createSnippet(data: Omit<Snippet, "id">): Promise<Snippet> {
  if (!readSession()?.demo)
    return request<Snippet>("/snippets", { method: "POST", body: JSON.stringify(data) });
  const rows = demoSnippets();
  const snippet = { ...data, id: Math.max(0, ...rows.map((r) => r.id)) + 1 };
  localStorage.setItem(DEMO_KEY, JSON.stringify([snippet, ...rows]));
  return snippet;
}

export async function deleteSnippet(id: number) {
  if (!readSession()?.demo) {
    await request(`/snippets/${id}`, { method: "DELETE" });
    return;
  }
  localStorage.setItem(DEMO_KEY, JSON.stringify(demoSnippets().filter((s) => s.id !== id)));
}

export const snippetsQuery = () =>
  queryOptions({
    queryKey: ["devvault", apiUrl(), readSession()?.usuario.id, readSession()?.demo ?? false],
    queryFn: listSnippets,
  });