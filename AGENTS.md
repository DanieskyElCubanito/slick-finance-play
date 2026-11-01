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

- Share preview-only farm state through a React context around the route outlet; no financial or persistent service is implied.
- Keep farm views in a shared screen module with distinct TanStack content routes and route-specific metadata.
- Render farm beds as an aligned responsive 3×3 ground grid with planted sprites separate from inventory icons, so crops stay contained inside their own soil beds at every screen size.
- Track occupied positions per bed through shared pure planting helpers, with separate position buttons and bed actions to avoid nested interactive controls and keep individual and bulk planting consistent.
- Use the shared Vite configuration's Nitro Vercel preset for external hosting while retaining Lovable's managed target override; this preserves SSR and direct navigation without SPA rewrites.
- External database connections must use the generated integration after the user links their project in settings; deployment preparation must not imply preview state is already persisted.
- Centralize economy values and pure crop transitions in a tested economy module; preview rewards never imply verified referrals, payments, withdrawals or closed-app processing.
