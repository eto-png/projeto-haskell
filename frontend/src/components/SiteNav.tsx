import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useSessionUser } from "@/hooks/use-session";

const linkCls = "text-sm text-muted-foreground hover:text-foreground transition-colors";

export function SiteNav() {
  const { user, ready } = useSessionUser();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const signOut = async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/login", replace: true });
  };

  return (
    <nav className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
        <Link to="/" className="flex items-center gap-2 font-bold">
          <span className="rounded-md bg-primary p-1.5 text-primary-foreground"><Activity className="h-4 w-4" /></span>
          LocalSEO Sentinel
        </Link>
        {ready && (user ? (
          <div className="flex items-center gap-5">
            <Link to="/dashboard" className={linkCls}>Dashboard</Link>
            <Link to="/account" className={linkCls}>Minha Conta</Link>
            <Link to="/subscription" className={linkCls}>Assinatura</Link>
            <Button size="sm" variant="outline" onClick={signOut}>Sair</Button>
          </div>
        ) : (
          <div className="flex items-center gap-5">
            <Link to="/" className={linkCls}>Início</Link>
            <a href="/#features" className={`${linkCls} hidden sm:inline`}>Recursos</a>
            <Link to="/pricing" className={linkCls}>Planos</Link>
            <Link to="/login" className={linkCls}>Entrar</Link>
            <Button size="sm" asChild><Link to="/signup">Criar Conta</Link></Button>
          </div>
        ))}
      </div>
    </nav>
  );
}
