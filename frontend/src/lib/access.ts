export type SubLike = {
  plan_id: string;
  subscription_active: boolean;
  trial_ends_at: string;
} | null | undefined;

export const PLANS = [
  {
    id: "starter",
    name: "Plano Essencial",
    price: 49,
    target: "Para profissionais autônomos e 1 local",
    features: ["Até 1 perfil do Google Meu Negócio", "Monitoramento diário", "Respostas com IA ativadas", "Suporte via e-mail"],
    cta: "Assinar Plano Essencial",
    popular: false,
  },
  {
    id: "pro",
    name: "Plano Profissional",
    price: 99,
    target: "Para comércios, clínicas e escritórios",
    features: [
      "Até 3 perfis do Google Meu Negócio",
      "Alertas em tempo real via WhatsApp",
      "Gerador de links/QR Code de coleta",
      "Assistente de contestação de fake reviews",
      "Suporte prioritário",
    ],
    cta: "Assinar Plano Profissional",
    popular: true,
  },
] as const;

export type PlanId = (typeof PLANS)[number]["id"];

export function inTrial(sub: SubLike, now = new Date()) {
  return !!sub && new Date(sub.trial_ends_at).getTime() > now.getTime();
}

/** Dashboard access: active subscription OR still within the 7-day trial. */
export function hasAccess(sub: SubLike, now = new Date()) {
  if (!sub) return false;
  return sub.subscription_active || inTrial(sub, now);
}

export function trialDaysLeft(sub: SubLike, now = new Date()) {
  if (!sub) return 0;
  return Math.max(0, Math.ceil((new Date(sub.trial_ends_at).getTime() - now.getTime()) / 86_400_000));
}
