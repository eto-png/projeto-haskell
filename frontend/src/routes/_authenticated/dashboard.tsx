import { createFileRoute, redirect } from "@tanstack/react-router";
export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Snippets — DevVault" },
      { name: "description", content: "Snippets do DevVault, seu cofre de código." },
      { property: "og:title", content: "Snippets — DevVault" },
      { property: "og:description", content: "Snippets do seu cofre de snippets." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  beforeLoad: () => {
    throw redirect({ to: "/", statusCode: 301 });
  },
});
