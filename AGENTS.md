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
