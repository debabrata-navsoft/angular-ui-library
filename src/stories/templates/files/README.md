# Templates

Every folder here is one template on the site's **Templates** page (`/templates`). The page reads this folder when the
site is built, so adding a template needs no code changes.

```
files/
  my-template/
    template.json      { "title", "description", "category", "tags": [] }
    html/              index.html, css/, js/, assets/logo.svg (also the favicon); also the live preview
    react/  react-ts/  a create-vite project: public/, src/ (main, App, index.css, components/, data/), eslint, tsconfigs
    next/  next-ts/    a create-next-app project: app/, components/, lib/, public/, next.config, eslint, @/ alias
    vue/  vue-ts/      a create-vite project for Vue: public/, src/ (main, App.vue, style.css, components/, data/), .vscode/
    angular/           an ng new project: public/, src/app/ (app.ts, app.config.ts, the page folder), angular.json,
                       tsconfig.json + tsconfig.app.json, .editorconfig, .vscode/; TypeScript only
```

- Leave out a folder and that framework or language isn't offered (its card or radio is disabled). HTML is
  JavaScript only and Angular TypeScript only.
- Visitors pick a framework and a language and download that folder as `my-template-<folder>.zip`
  (`my-template-react-ts.zip`), with its files as they are.
- Text files (html, css, js, jsx, ts, tsx, vue, json, md, svg, …), the dot files `.gitignore`, `.editorconfig` and
  `.vscode/*.json`, and images or fonts (png, jpg, webp, woff2, …) are included. The live preview inlines `index.html`'s own `<link href="….css">` and `<script src="….js">` files.
- Every folder is a complete project, everything but node_modules: `npm install`, then `npm start` / `npm run dev`.
  Keep downloads self-contained (no imports from this repo), so they run anywhere.
- These files are excluded from the project's TypeScript builds (`tsconfig.app.json`, `.storybook/tsconfig.json`).
