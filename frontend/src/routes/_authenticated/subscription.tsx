import { createFileRoute, redirect } from "@tanstack/react-router";
export const Route = createFileRoute("/_authenticated/subscription")({
  head: () => ({
    meta: [
      { title: "Cofre — DevVault" },
      { name: "description", content: "Cofre do DevVault, seu cofre de código." },
      { property: "og:title", content: "Cofre — DevVault" },
      { property: "og:description", content: "Cofre do seu cofre de snippets." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  beforeLoad: () => {
    throw redirect({ to: "/", statusCode: 301 });
  },
});
