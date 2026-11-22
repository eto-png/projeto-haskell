import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const navigate = useNavigate();
  const [f, setF] = useState({ name: "", business: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email: f.email, password: f.password,
        options: { emailRedirectTo: window.location.origin + "/dashboard", data: { full_name: f.name, business_name: f.business } },
      });
      setLoading(false);
      if (error) { toast.error(error.message); return; }
      setSent(true);
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email: f.email, password: f.password });
      setLoading(false);
      if (error) { toast.error("E-mail ou senha inválidos"); return; }
      navigate({ to: "/dashboard" });
    }
  };

  const google = async () => {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (r.error) { toast.error("Não foi possível entrar com Google"); return; }
    if (r.redirected) return;
    navigate({ to: "/dashboard" });
  };

  if (sent) return (
    <div className="mx-auto max-w-md rounded-xl border bg-card p-8 text-center shadow-sm">
      <h1 className="text-xl font-bold">Confirme seu e-mail</h1>
      <p className="mt-2 text-sm text-muted-foreground">Enviamos um link para {f.email}. Clique nele para ativar seu teste grátis de 7 dias.</p>
    </div>
  );

  return (
    <div className="mx-auto max-w-md rounded-xl border bg-card p-8 shadow-sm">
      <h1 className="text-2xl font-bold">{mode === "signup" ? "Crie sua conta" : "Entrar"}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{mode === "signup" ? "7 dias grátis, sem cartão." : "Bem-vindo de volta."}</p>
      <Button type="button" variant="outline" className="mt-6 w-full" onClick={google}>Continuar com Google</Button>
      <div className="my-4 text-center text-xs text-muted-foreground">ou</div>
      <form onSubmit={submit} className="space-y-3">
        {mode === "signup" && <>
          <Input required placeholder="Seu nome" value={f.name} onChange={set("name")} maxLength={80} />
          <Input required placeholder="Nome do negócio/empresa" value={f.business} onChange={set("business")} maxLength={100} />
        </>}
        <Input required type="email" placeholder="E-mail" value={f.email} onChange={set("email")} />
        <Input required type="password" minLength={6} placeholder="Senha" value={f.password} onChange={set("password")} />
        <Button type="submit" className="w-full" disabled={loading}>{loading ? "Aguarde..." : mode === "signup" ? "Criar Conta" : "Entrar"}</Button>
      </form>
      <p className="mt-4 text-center text-sm text-muted-foreground">
        {mode === "signup" ? <>Já tem conta? <Link to="/login" className="text-foreground underline">Entrar</Link></>
          : <>Não tem conta? <Link to="/signup" className="text-foreground underline">Criar Conta</Link></>}
      </p>
    </div>
  );
}
