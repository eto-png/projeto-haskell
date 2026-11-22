<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- DevVault consumes the external Servant REST API from a browser-only service; never send its tokens to Supabase or server functions, because authentication belongs to that API.
- Scope external sessions to the configured API URL and clear them when it changes, preventing bearer-token leakage to a different host.
- Local demonstration mode is explicit, independent of real API accounts, and persists only example snippets in browser storage; configured API failures never fall back silently.
- The vault uses a client-only route loader with React Query and an external-session gate, because its bearer token is stored in localStorage.
