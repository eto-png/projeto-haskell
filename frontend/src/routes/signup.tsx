import { createFileRoute, redirect } from "@tanstack/react-router";
export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Criar conta — DevVault" },
      { name: "description", content: "Criar conta do DevVault, seu cofre de código." },
      { property: "og:title", content: "Criar conta — DevVault" },
      { property: "og:description", content: "Criar conta do seu cofre de snippets." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  beforeLoad: () => {
    throw redirect({ to: "/auth", statusCode: 301 });
  },
});
