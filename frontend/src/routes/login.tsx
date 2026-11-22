import { createFileRoute, redirect } from "@tanstack/react-router";
export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Entrar — DevVault" },
      { name: "description", content: "Entrar do DevVault, seu cofre de código." },
      { property: "og:title", content: "Entrar — DevVault" },
      { property: "og:description", content: "Entrar do seu cofre de snippets." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  beforeLoad: () => {
    throw redirect({ to: "/auth", statusCode: 301 });
  },
});
