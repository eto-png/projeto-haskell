import { useState } from "react";
import { Plus, Loader2, Eye } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LANGUAGES, languageClass } from "@/lib/vault";
import { createSnippet } from "@/lib/devvault-api";
import { CodeBlock, LanguageBadge } from "./SnippetCard";
export function NewSnippet({
  open,
  onOpenChange,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  onSaved: () => Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [language, setLanguage] = useState("JavaScript");
  const [code, setCode] = useState("");
  const [saving, setSaving] = useState(false);
  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!saving) onOpenChange(value);
      }}
    >
      <DialogContent className="max-h-[90dvh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="text-primary" size={20} />
            Novo snippet
          </DialogTitle>
          <DialogDescription>Guarde aquele trecho que você vai usar de novo.</DialogDescription>
        </DialogHeader>
        <form
          className="space-y-5"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!title.trim() || !code.trim()) {
              toast.error("Preencha o título e o código.");
              return;
            }
            setSaving(true);
            try {
              await createSnippet({ titulo: title.trim(), linguagem: language, codigo: code });
              await onSaved();
              setTitle("");
              setCode("");
              onOpenChange(false);
              toast.success("Snippet salvo no cofre!");
            } catch (err) {
              toast.error(err instanceof Error ? err.message : "Não foi possível salvar.");
            } finally {
              setSaving(false);
            }
          }}
        >
          <div className="grid gap-4 sm:grid-cols-[1fr_190px]">
            <label className="block space-y-2 text-sm">
              Título
              <Input
                autoFocus
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex.: Resetar URL remota no Git"
              />
            </label>
            <div className="space-y-2 text-sm">
              <label id="language-label">Linguagem</label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger aria-labelledby="language-label">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
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
          </div>
          <label className="block space-y-2 text-sm">
            Código ou comando
            <Textarea
              className="min-h-40 font-mono text-xs leading-6"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Cole seu código aqui..."
              spellCheck={false}
            />
          </label>
          <div>
            <p className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
              <Eye size={14} />
              Prévia
            </p>
            <div className={`snippet-card ${languageClass(language)}`}>
              <div className="flex flex-wrap items-center justify-between gap-2 p-4">
                <span className="break-all text-sm font-semibold">
                  {title || "Título do snippet"}
                </span>
                <LanguageBadge language={language} />
              </div>
              <CodeBlock code={code || "// Seu código começa aqui"} />
            </div>
          </div>
          <div className="flex justify-end gap-2 border-t pt-4">
            <Button
              type="button"
              variant="ghost"
              disabled={saving}
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button disabled={saving} type="submit">
              {saving ? <Loader2 className="animate-spin" /> : <Plus />}Salvar snippet
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
