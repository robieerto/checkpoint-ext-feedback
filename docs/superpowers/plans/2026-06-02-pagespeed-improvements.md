# PageSpeed Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve guest portal mobile PageSpeed Performance score from 65 → 85+ by eliminating ~400 KB of unused JS/CSS and fixing render-blocking resources.

**Architecture:** Three main changes in `main.ts` + `vite.config.ts`: (1) switch Vuetify to tree-shaken auto-import via `vite-plugin-vuetify`, (2) remove unused Bootstrap, (3) replace the full MDI icon font with individual SVG imports. Plus small fixes for caching, font loading, meta description, and contrast.

**Tech Stack:** Vue 3, Vuetify 3, Vite, vite-plugin-vuetify, @mdi/js, unplugin-vue-components, unplugin-fonts, Firebase Hosting

---

## File Map

| File | Change |
|---|---|
| `vite.config.ts` | Add `vite-plugin-vuetify`, add `display: 'swap'` to Roboto font |
| `src/main.ts` | Remove full Vuetify/Bootstrap/MDI imports; configure SVG icon set |
| `firebase.json` | Add `Cache-Control` headers for hashed assets |
| `index.html` | Add meta description |
| `src/assets/main.css` | Fix `.opacity-text` contrast |
| `src/components/Actions/ReviewComplexAction.vue` | Replace `fw-bold` Bootstrap class |
| `src/components/ActionListView.vue` | Replace `m-0` Bootstrap class |

---

## Task 1: Wire up vite-plugin-vuetify for tree-shaking

**What this does:** `vite-plugin-vuetify` already exists in devDependencies but is never used. Enabling it means only Vuetify components actually used in templates are bundled (JS + CSS). Removes ~200 KB JS and ~100 KB CSS.

**Files:**
- Modify: `vite.config.ts`
- Modify: `src/main.ts`

- [ ] **Step 1: Update `vite.config.ts`**

Replace the plugins array. Add `vuetify({ autoImport: true })` after `vue()`. Also add `display: 'swap'` to the Roboto font config to fix the render-blocking audit:

```ts
import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import type { PreRenderedAsset } from 'rollup'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vuetify from 'vite-plugin-vuetify'
import Components from 'unplugin-vue-components/vite'
import ViteFonts from 'unplugin-fonts/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE')
  return {
    define: {
      __API_URL__: JSON.stringify(env.VITE_API_URL)
    },
    plugins: [
      vue(),
      vueJsx(),
      vuetify({ autoImport: true }),
      Components(),
      ViteFonts({
        google: {
          families: [
            {
              name: 'Roboto',
              styles: 'wght@100;300;400;500;700;900',
              display: 'swap',
            }
          ]
        }
      })
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    server: {
      host: '0.0.0.0',
      port: 4173,
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:5001/checkpoint-a9/europe-west3',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
    build: {
      rollupOptions: {
        output: {
          assetFileNames: (assetInfo: PreRenderedAsset) => {
            if (assetInfo.name === 'firebase-messaging-sw.js') {
              return '[name][extname]'
            }
            return 'assets/[name]-[hash][extname]'
          }
        }
      }
    }
  }
})
```

- [ ] **Step 2: Update `src/main.ts` — remove full component/directive imports**

Remove the wildcard imports and the `components`/`directives` keys from `createVuetify`. The plugin handles this at build time:

```ts
import './assets/main.css'
import './assets/actionListView.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import * as Sentry from '@sentry/vue'

import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import { VNumberInput } from 'vuetify/labs/VNumberInput'

const vuetify = createVuetify({
  components: { VNumberInput },
})

const app = createApp(App)
app.use(vuetify).use(router)

Sentry.init({
  app,
  dsn: import.meta.env.VITE_SENTRY_DSN,
  enableLogs: true
})

app.mount('#app')

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/firebase-messaging-sw.js')
    .then((registration) => {
      console.log('Service Worker registered successfully:', registration)
    })
    .catch((error) => {
      console.error('Service Worker registration failed:', error)
    })
}
```

Note: `@mdi/font` and `bootstrap` CSS imports are intentionally omitted here — they are removed in Tasks 2 and 3 respectively.

- [ ] **Step 3: Verify the build still compiles**

```bash
cd checkpoint-guest-portal
npm run build
```

Expected: build succeeds with no TS errors. The output chunks should be noticeably smaller than before (check `dist/assets/` file sizes). If any component throws "failed to resolve" at runtime, that component needs to be explicitly imported — but with `autoImport: true` this shouldn't happen for standard Vuetify components.

- [ ] **Step 4: Commit**

```bash
git add vite.config.ts src/main.ts
git commit -m "perf: enable vite-plugin-vuetify tree-shaking, add font display swap"
```

---

## Task 2: Remove Bootstrap

**What this does:** Bootstrap CSS is fully unused — the app uses Vuetify for everything. Removes ~30 KB CSS. Two templates use Bootstrap utility classes that need replacing.

**Files:**
- Modify: `src/components/Actions/ReviewComplexAction.vue`
- Modify: `src/components/ActionListView.vue`

- [ ] **Step 1: Replace `fw-bold` in ReviewComplexAction.vue**

There are two occurrences (lines 194 and 241). Replace the Bootstrap `fw-bold` class with the Vuetify equivalent `font-weight-bold`:

Line 194 — change:
```html
<p v-if="text?.textQuestion" class="fw-bold">{{ text?.textQuestion }}</p>
```
to:
```html
<p v-if="text?.textQuestion" class="font-weight-bold">{{ text?.textQuestion }}</p>
```

Line 241 — change:
```html
<p class="pb-1 fw-bold">{{ (questionForm as any)?.question }}</p>
```
to:
```html
<p class="pb-1 font-weight-bold">{{ (questionForm as any)?.question }}</p>
```

- [ ] **Step 2: Replace `m-0` in ActionListView.vue**

Line 110 — `m-0` is a Bootstrap margin-reset. Replace with Vuetify's `ma-0`:

```html
<v-row class="ma-0">
```

- [ ] **Step 3: Uninstall Bootstrap and roboto-fontface**

`roboto-fontface` is also in dependencies but never imported (Roboto is loaded via ViteFonts). Remove both:

```bash
npm uninstall bootstrap roboto-fontface
```

- [ ] **Step 4: Verify build**

```bash
npm run build
```

Expected: build succeeds. No visual regressions in the templates that used `fw-bold` or `m-0`.

- [ ] **Step 5: Commit**

```bash
git add src/components/Actions/ReviewComplexAction.vue src/components/ActionListView.vue package.json package-lock.json
git commit -m "perf: remove unused Bootstrap and roboto-fontface packages"
```

---

## Task 3: Replace MDI icon font with SVG imports

**What this does:** `@mdi/font` loads a CSS file + a ~200 KB WOFF2 font file containing all 7000+ Material Design icons. The portal uses only 10 icons. Replacing with named SVG imports from `@mdi/js` eliminates the font download entirely.

The approach: use `vuetify/iconsets/mdi-svg` (already ships with Vuetify) and extend its `aliases` with only the icons the app uses. Vuetify resolves `mdi-comment-text` → strips prefix → camelCases → `commentText` → looks up in aliases.

**Icons used in this app** (found by grepping templates):
`mdi-alert-circle`, `mdi-bell-outline`, `mdi-check-circle`, `mdi-chevron-down`, `mdi-chevron-left`, `mdi-chevron-up`, `mdi-close`, `mdi-comment-text`, `mdi-help-circle`, `mdi-information-outline`

**Files:**
- Modify: `src/main.ts`

- [ ] **Step 1: Install `@mdi/js`, uninstall `@mdi/font`**

```bash
npm install @mdi/js
npm uninstall @mdi/font
```

- [ ] **Step 2: Update `src/main.ts` to configure the SVG iconset**

Add the icon imports and configure `createVuetify` with the icon set. The full `src/main.ts` now looks like:

```ts
import './assets/main.css'
import './assets/actionListView.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import * as Sentry from '@sentry/vue'

import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import { VNumberInput } from 'vuetify/labs/VNumberInput'
import { aliases as defaultAliases, mdi } from 'vuetify/iconsets/mdi-svg'
import {
  mdiAlertCircle,
  mdiBellOutline,
  mdiCheckCircle,
  mdiChevronDown,
  mdiChevronLeft,
  mdiChevronUp,
  mdiClose,
  mdiCommentText,
  mdiHelpCircle,
  mdiInformationOutline,
} from '@mdi/js'

const vuetify = createVuetify({
  components: { VNumberInput },
  icons: {
    defaultSet: 'mdi',
    aliases: {
      ...defaultAliases,
      alertCircle: mdiAlertCircle,
      bellOutline: mdiBellOutline,
      checkCircle: mdiCheckCircle,
      chevronDown: mdiChevronDown,
      chevronLeft: mdiChevronLeft,
      chevronUp: mdiChevronUp,
      close: mdiClose,
      commentText: mdiCommentText,
      helpCircle: mdiHelpCircle,
      informationOutline: mdiInformationOutline,
    },
    sets: { mdi },
  },
})

const app = createApp(App)
app.use(vuetify).use(router)

Sentry.init({
  app,
  dsn: import.meta.env.VITE_SENTRY_DSN,
  enableLogs: true
})

app.mount('#app')

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/firebase-messaging-sw.js')
    .then((registration) => {
      console.log('Service Worker registered successfully:', registration)
    })
    .catch((error) => {
      console.error('Service Worker registration failed:', error)
    })
}
```

- [ ] **Step 3: Build and visually verify icons render**

```bash
npm run build && npm run preview
```

Open the app and check that:
- The feedback button shows the comment icon (`mdi-comment-text`)
- The notification bell icon renders (`mdi-bell-outline`)
- Vuetify internal icons (dropdown chevrons in `v-select`, close `×` in dialogs) render correctly

If any icon appears as an empty square, it means its alias key is missing. The alias key is derived from the template usage: `mdi-foo-bar` → `fooBar`. Add the missing icon to both the imports and the `aliases` object in `createVuetify`.

- [ ] **Step 4: Commit**

```bash
git add src/main.ts package.json package-lock.json
git commit -m "perf: replace @mdi/font with @mdi/js SVG icon imports"
```

---

## Task 4: Firebase hosting cache headers

**What this does:** Vite outputs all JS/CSS assets with content hashes in their filenames (e.g., `index-a1b2c3.js`). These can be cached indefinitely. Firebase Hosting currently sends no `Cache-Control` header, so browsers re-validate on every visit. Fixes the "214 KB missing cache headers" audit.

**Files:**
- Modify: `firebase.json`

- [ ] **Step 1: Add cache headers to `firebase.json`**

Add a `headers` array inside the `hosting` object, before `rewrites`:

```json
{
  "hosting": {
    "site": "ofrules-guests",
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "headers": [
      {
        "source": "/assets/**",
        "headers": [
          { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
        ]
      },
      {
        "source": "/index.html",
        "headers": [
          { "key": "Cache-Control", "value": "no-cache" }
        ]
      }
    ],
    "rewrites": [
      {
        "source": "/api/addFCMToken",
        "function": { "functionId": "addFCMToken", "region": "europe-west3" }
      },
      {
        "source": "/api/extFeedbackActionData",
        "function": { "functionId": "extFeedbackActionData", "region": "europe-west3" }
      },
      {
        "source": "/api/createExtUserOrder",
        "function": { "functionId": "createExtUserOrder", "region": "europe-west3" }
      },
      {
        "source": "/api/createOccurrenceExt",
        "function": { "functionId": "createOccurrenceExt", "region": "europe-west3" }
      },
      {
        "source": "/api/createExtUserQuestion",
        "function": { "functionId": "createExtUserQuestion", "region": "europe-west3" }
      },
      {
        "source": "/api/createExtUserReview",
        "function": { "functionId": "createExtUserReview", "region": "europe-west3" }
      }
    ]
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add firebase.json
git commit -m "perf: add long-lived cache headers for hashed assets"
```

---

## Task 5: Meta description + color contrast

**What this does:** Two small fixes — add a meta description (fixes the SEO audit, SEO 90 → ~100) and raise the `.opacity-text` contrast ratio to meet WCAG AA (Accessibility 89 → ~95).

**Files:**
- Modify: `index.html`
- Modify: `src/assets/main.css`

- [ ] **Step 1: Add meta description to `index.html`**

Add after the `<meta name="viewport">` line:

```html
<meta name="description" content="Scan a QR code to request services, leave feedback, or make a reservation at your location." />
```

- [ ] **Step 2: Fix `.opacity-text` contrast in `src/assets/main.css`**

The current value `opacity: 0.2` results in ~20% grey on a light background — far below the WCAG AA minimum contrast ratio of 4.5:1. Change to `0.5` which gives sufficient contrast while keeping the muted appearance:

```css
.opacity-text {
  opacity: 0.5;
}
```

- [ ] **Step 3: Commit**

```bash
git add index.html src/assets/main.css
git commit -m "fix: add meta description, improve opacity-text contrast for WCAG AA"
```

---

## Task 6: Verify score improvement

- [ ] **Step 1: Build**

```bash
npm run build
```

Check `dist/assets/` — the JS bundle(s) should be significantly smaller than before Tasks 1–3. Compare before/after:
- Before: single chunk ~800 KB+
- After: main chunk should be ~200–300 KB (Vuetify tree-shaken, Bootstrap gone, MDI font gone)

- [ ] **Step 2: Deploy to Firebase Hosting**

```bash
firebase deploy --only hosting
```

- [ ] **Step 3: Run PageSpeed analysis**

Wait ~2 minutes after deploy, then re-run:

```bash
# Use the pagespeed-insights MCP or visit:
# https://pagespeed.web.dev/analysis?url=https://guest.ofrules.com
```

**Expected targets:**
| Metric | Before | Target |
|---|---|---|
| Performance | 65 | 85+ |
| FCP | 3.5s (poor) | <2s (good) |
| LCP | 8.1s (poor) | <4s (needs improvement) |
| SEO | 90 | ~100 |
| Accessibility | 89 | ~95 |

- [ ] **Step 4: Push branch**

```bash
git push --set-upstream origin improv/eng-101-improve-guest-portal-pagespeed-score-performance-65-85
```

---

## Scope note

The router has a single route (`/` → `App.vue`), so "lazy-load routes" from the Linear issue does not apply here — there is nothing to split.
