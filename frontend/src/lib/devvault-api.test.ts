import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  authenticate,
  configureApi,
  createSnippet,
  deleteSnippet,
  enterDemo,
  listSnippets,
  normalizeApiUrl,
  readSession,
} from "./devvault-api";
beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});
describe("DevVault REST contract", () => {
  it("uses the requested register body and stores the returned token", async () => {
    configureApi("https://api.example.com/");
    const fetcher = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(
        new Response(
          JSON.stringify({
            token: "test-token",
            usuario: { id: 7, nome: "Alex", email: "alex@example.com" },
          }),
        ),
      );
    await authenticate("register", { nome: "Alex", email: "alex@example.com", senha: "test-only" });
    expect(fetcher.mock.calls[0]?.[0]).toBe("https://api.example.com/register");
    expect(JSON.parse(String(fetcher.mock.calls[0]?.[1]?.body))).toEqual({
      nome: "Alex",
      email: "alex@example.com",
      senha: "test-only",
    });
    expect(readSession()?.token).toBe("test-token");
  });
  it("includes the bearer token on snippet requests", async () => {
    configureApi("https://api.example.com");
    const fetcher = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            token: "test-token",
            usuario: { id: 1, nome: "Alex", email: "alex@example.com" },
          }),
        ),
      )
      .mockResolvedValueOnce(new Response("[]"));
    await authenticate("login", { email: "alex@example.com", senha: "test" });
    await listSnippets();
    expect(fetcher.mock.calls[1]?.[0]).toBe("https://api.example.com/snippets");
    expect(fetcher.mock.calls[1]?.[1]?.headers).toMatchObject({
      Authorization: "Bearer test-token",
    });
  });
  it("clears the session when the API URL changes", () => {
    enterDemo();
    configureApi("https://other.example.com");
    expect(readSession()).toBeNull();
  });
  it("does not silently fall back when the configured API is offline", async () => {
    configureApi("https://api.example.com");
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new TypeError("offline"));
    await expect(listSnippets()).rejects.toThrow("Não foi possível conectar");
  });
  it("persists created snippets and confirmed deletions in demo mode", async () => {
    enterDemo();
    const s = await createSnippet({ titulo: "Teste", linguagem: "Git", codigo: "git status" });
    expect((await listSnippets()).at(0)).toEqual(s);
    await deleteSnippet(s.id);
    expect((await listSnippets()).some((r) => r.id === s.id)).toBe(false);
  });
  it("rejects non-HTTP API URLs", () => {
    expect(() => normalizeApiUrl("javascript:alert(1)")).toThrow();
    expect(normalizeApiUrl("http://localhost:8080/")).toBe("http://localhost:8080");
  });
});
