import { describe, expect, it } from "vitest";
import { filterSnippets, languageClass, LANGUAGES } from "./vault";
const rows = [
  { id: 1, titulo: "Resetar Git", linguagem: "Git", codigo: "git reset --soft HEAD~1" },
  { id: 2, titulo: "Função", linguagem: "JavaScript", codigo: "const hello = 1;" },
];
describe("snippet filters", () => {
  it("finds snippets by title in real time", () =>
    expect(filterSnippets(rows, "resetar", "Todas").map((s) => s.id)).toEqual([1]));
  it("finds snippets by code", () =>
    expect(filterSnippets(rows, "HEAD~1", "Todas").map((s) => s.id)).toEqual([1]));
  it("combines language and search", () =>
    expect(filterSnippets(rows, "const", "Git")).toEqual([]));
  it("assigns distinct classes to all twelve official languages", () => {
    expect(LANGUAGES).toHaveLength(12);
    expect(new Set(LANGUAGES.map(languageClass)).size).toBe(12);
    expect(languageClass("unknown")).toBe("language-11");
  });
});
