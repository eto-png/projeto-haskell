import { createFileRoute, redirect } from "@tanstack/react-router";
export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({
    meta: [
      { title: "Conta — DevVault" },
      { name: "description", content: "Conta do DevVault, seu cofre de código." },
      { property: "og:title", content: "Conta — DevVault" },
      { property: "og:description", content: "Conta do seu cofre de snippets." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  beforeLoad: () => {
    throw redirect({ to: "/auth", statusCode: 301 });
  },
});
