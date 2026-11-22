import { useEffect, useRef, useState } from "react";
import { Check, Copy, Trash2, Code2, Terminal } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { languageClass, type Snippet } from "@/lib/vault";
export function CodeBlock({ code }: { code: string }) {
  return (
    <pre className="code-block">
      <code>
        {code.split("\n").map((line, i) => (
          <span key={i} className="code-line">
            <span aria-hidden="true" className="line-number">
              {i + 1}
            </span>
            <span>
              {line
                .split(
                  /(#[^\n]*|\/\/[^\n]*|"[^"\n]*"|'[^'\n]*'|\b(?:const|let|return|type|boolean|string|number|SELECT|FROM|GROUP BY|HAVING|ORDER BY|DESC|AS|import|pure|await)\b)/g,
                )
                .map((part, j) => (
                  <span
                    key={j}
                    className={
                      part.startsWith("#") || part.startsWith("//")
                        ? "text-code-comment"
                        : part.startsWith('"') || part.startsWith("'")
                          ? "text-code-string"
                          : /^(const|let|return|type|boolean|string|number|SELECT|FROM|GROUP BY|HAVING|ORDER BY|DESC|AS|import|pure|await)$/.test(
                                part,
                              )
                            ? "text-code-keyword"
                            : ""
                    }
                  >
                    {part}
                  </span>
                ))}
            </span>
          </span>
        ))}
      </code>
    </pre>
  );
}
export function LanguageBadge({ language }: { language: string }) {
  return (
    <span className={`language-badge ${languageClass(language)}`}>
      <span className="language-dot" />
      {language === "Bash / Terminal" ? "Bash" : language}
    </span>
  );
}
export function SnippetCard({ snippet, onDelete }: { snippet: Snippet; onDelete: () => void }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  return (
    <article className={`snippet-card ${languageClass(snippet.linguagem)}`}>
      <div className="flex min-h-20 items-start justify-between gap-3 px-5 pb-3 pt-5">
        <div className="min-w-0">
          <h2 className="break-words text-sm font-semibold leading-6">{snippet.titulo}</h2>
          <div className="mt-2">
            <LanguageBadge language={snippet.linguagem} />
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="-mr-2 -mt-1 shrink-0 text-muted-foreground hover:text-destructive"
          title="Excluir snippet"
          aria-label={`Excluir ${snippet.titulo}`}
          onClick={onDelete}
        >
          <Trash2 size={15} />
        </Button>
      </div>
      <CodeBlock code={snippet.codigo} />
      <footer className="flex h-14 items-center justify-between px-5">
        <span className="flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground">
          {snippet.linguagem === "Git" || snippet.linguagem === "Bash / Terminal" ? (
            <Terminal size={12} />
          ) : (
            <Code2 size={12} />
          )}
          {snippet.codigo.split("\n").length} linhas
        </span>
        <Button
          className={`w-24 ${copied ? "text-success" : "text-muted-foreground"}`}
          variant="ghost"
          size="sm"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(snippet.codigo);
              setCopied(true);
              if (timer.current) clearTimeout(timer.current);
              timer.current = setTimeout(() => setCopied(false), 2000);
            } catch {
              toast.error("Não foi possível copiar. Verifique a permissão do navegador.");
            }
          }}
        >
          {copied ? <Check /> : <Copy />}
          {copied ? "Copiado!" : "Copiar"}
        </Button>
      </footer>
    </article>
  );
}
