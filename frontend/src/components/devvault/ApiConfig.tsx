import { useState } from "react";
import { Settings2, Link2 } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { apiUrl, configureApi } from "@/lib/devvault-api";
export function ApiConfig() {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const navigate = useNavigate();
  const client = useQueryClient();
  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          setUrl(apiUrl());
          setOpen(true);
        }}
      >
        <Settings2 />
        Configurar API
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Link2 size={20} />
              Conexão com a API
            </DialogTitle>
            <DialogDescription>
              Use a URL pública do seu servidor Haskell ou a porta encaminhada do Codespaces.
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-5"
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                configureApi(url);
                client.clear();
                setOpen(false);
                await navigate({ to: "/auth" });
                toast.success("Configuração salva. Entre para conectar seu cofre.");
              } catch (err) {
                toast.error(err instanceof Error ? err.message : "URL inválida");
              }
            }}
          >
            <label className="block space-y-2 text-sm">
              URL da API
              <Input
                aria-label="URL da API"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://seu-codespace-8080.app.github.dev"
              />
            </label>
            <p className="text-xs text-muted-foreground">
              Deixe em branco para usar apenas a demonstração local. Alterar a URL encerra a sessão
              atual.
            </p>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Salvar conexão</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
