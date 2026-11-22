// Client for the Haskell Servant backend. Falls back to local mock data when unreachable.
export const API_BASE =
  (import.meta.env["VITE_API_BASE_URL"] as string | undefined) ?? "http://localhost:8080/api/v1";

export type Review = {
  reviewId: string;
  authorName: string;
  rating: number;
  comment: string;
  createdAt: string;
  isAnswered: boolean;
};

export type ReplyRequest = { reviewText: string; starRating: number; tone: string };
export type ReplyResponse = { suggestedReply: string; includeSeoKeywords: string[] };

export const MOCK_REVIEWS: Review[] = [
  { reviewId: "r1", authorName: "Mariana Costa", rating: 5, comment: "Atendimento impecável! O técnico chegou no horário e resolveu tudo rapidamente. Recomendo muito.", createdAt: "2026-10-12", isAnswered: false },
  { reviewId: "r2", authorName: "Carlos Mendes", rating: 3, comment: "Serviço bom, mas o orçamento demorou mais do que o combinado.", createdAt: "2026-10-10", isAnswered: false },
  { reviewId: "r3", authorName: "Juliana Ribeiro", rating: 1, comment: "Péssima experiência, ninguém retornou minhas ligações.", createdAt: "2026-10-08", isAnswered: false },
  { reviewId: "r4", authorName: "Rafael Souza", rating: 5, comment: "Melhor empresa da região, preço justo e equipe educada.", createdAt: "2026-10-05", isAnswered: true },
];

export type Sentiment = "Positivo" | "Neutro" | "Crítico";
export const sentimentOf = (rating: number): Sentiment =>
  rating >= 4 ? "Positivo" : rating === 3 ? "Neutro" : "Crítico";

export async function fetchReviews(): Promise<{ data: Review[]; mock: boolean }> {
  try {
    const res = await fetch(`${API_BASE}/reviews`);
    if (!res.ok) throw new Error();
    return { data: (await res.json()) as Review[], mock: false };
  } catch {
    return { data: MOCK_REVIEWS, mock: true };
  }
}

export function mockReply(req: ReplyRequest): ReplyResponse {
  const kw = ["atendimento em São Paulo", "assistência técnica local", "serviço de confiança"];
  const by: Record<string, string> = {
    "Agradecido & SEO Local": `Muito obrigado pela avaliação de ${req.starRating} estrelas! Ficamos felizes em oferecer o melhor ${kw[1]} e um ${kw[2]} para toda a região. Conte sempre conosco!`,
    "Profissional & Contenção de Danos": `Agradecemos seu retorno. Levamos cada comentário a sério e gostaríamos de entender melhor o ocorrido. Por favor, entre em contato pelo nosso canal oficial para que possamos resolver com prioridade.`,
    "Pedido de Desculpas": `Pedimos sinceras desculpas pela experiência. Não é o padrão que buscamos. Nossa equipe entrará em contato para corrigir a situação o quanto antes.`,
  };
  return { suggestedReply: by[req.tone] ?? by["Agradecido & SEO Local"]!, includeSeoKeywords: kw };
}

export async function generateReply(req: ReplyRequest): Promise<ReplyResponse & { mock: boolean }> {
  try {
    const res = await fetch(`${API_BASE}/generate-reply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
    });
    if (!res.ok) throw new Error();
    return { ...((await res.json()) as ReplyResponse), mock: false };
  } catch {
    return { ...mockReply(req), mock: true };
  }
}

export function whatsappLink(name: string, phone: string, reviewUrl: string) {
  const digits = phone.replace(/\D/g, "");
  const full = digits.startsWith("55") ? digits : `55${digits}`;
  const msg = `Olá ${name}! Obrigado pela confiança. Poderia avaliar nosso atendimento no Google? Leva 30 segundos: ${reviewUrl}`;
  return `https://wa.me/${full}?text=${encodeURIComponent(msg)}`;
}

export function disputeDraft(text: string) {
  return `Prezada equipe do Google Meu Negócio,

Solicitamos a análise e remoção da avaliação abaixo, por violar as Políticas de Conteúdo Proibido e Restrito do Google Maps (conteúdo falso / conflito de interesses / sem experiência real com o estabelecimento):

"${text.trim()}"

Motivos:
1. Não há registro deste cliente em nosso sistema de atendimentos.
2. O conteúdo descreve fatos que não correspondem aos nossos serviços.
3. O padrão sugere avaliação não autêntica.

Pedimos a revisão conforme as diretrizes de avaliações do Google.

Atenciosamente,
[Nome do Negócio]`;
}
