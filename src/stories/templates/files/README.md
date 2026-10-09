# Templates

Every folder here is one template on the site's **Templates** page (`/templates`). The page reads this folder when the
site is built, so adding a template needs no code changes.

```
files/
  my-template/
    template.json      { "title", "description", "category", "tags": [] }
    html/              index.html + its .css and .js (also the live preview: keep the files next to index.html)
    react/  react-ts/  a Vite project (package.json, vite.config, index.html, src/…), JavaScript / TypeScript
    next/  next-ts/    a Next.js App Router project (package.json, next.config.mjs, app/, components/)
    vue/  vue-ts/      a Vite project for Vue (<script setup> / <script setup lang="ts">)
    angular/           an Angular CLI project (package.json, angular.json, tsconfig, src/main.ts, src/app/…); TypeScript only
```

- Leave out a folder and that framework or language isn't offered (its card or radio is disabled). HTML is
  JavaScript only and Angular TypeScript only.
- Visitors pick a framework and a language and download that folder as `my-template-<folder>.zip`
  (`my-template-react-ts.zip`), with its files as they are.
- Text files (html, css, js, jsx, ts, tsx, vue, json, md, svg, …) and images or fonts (png, jpg, webp, woff2, …) are
  included. The live preview inlines `index.html`'s own `<link href="….css">` and `<script src="….js">` files.
- Every folder is a complete project, everything but node_modules: `npm install`, then `npm start` / `npm run dev`.
  Keep downloads self-contained (no imports from this repo), so they run anywhere.
- These files are excluded from the project's TypeScript builds (`tsconfig.app.json`, `.storybook/tsconfig.json`).
