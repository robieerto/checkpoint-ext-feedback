# Feedback Button Redesign + Empty State

## Goal

Redesign the guest portal feedback button to be visually distinct and clearly about the app (not the hotel), simplify the backend by removing the `guestPlatformFeedbackQuestion` collection, and add a branded empty state for direct URL access.

## Architecture

The feedback button becomes a simple on/off toggle per building — no external action template needed. All UI text is hardcoded per language in the frontend. The backend returns a boolean `feedbackButtonEnabled` instead of a full action object.

## Scope

Four areas change: FooterComponent (button style + label), FeedbackAction (hardcoded texts), backend endpoint (simplified response), and a new NoParamsView component.

---

## 1. Feedback Button (FooterComponent)

**Style:** Outlined navy pill with `mdi-comment-text` icon. Uses `variant="outlined"`, `color="#003c69"`, `border-radius: 100px`. Consistent with the app's pill button language but visually distinct from filled tile cards.

**Label:** Hardcoded per language, not from the store:

| Lang | Label |
|------|-------|
| `en` | "How is this app?" |
| `sk` | "Ako funguje táto appka?" |
| `cz` | "Jak funguje tato appka?" |
| fallback | "How is this app?" |

**Condition:** `v-if="store.feedbackButtonEnabled"` (replaces `v-if="store.feedbackAction"`).

---

## 2. FeedbackAction Dialog

All texts hardcoded in a `const texts` map inside the component. `store.feedbackAction` is no longer read.

| Field | EN | SK | CZ |
|---|---|---|---|
| `title` | "How is this app working for you?" | "Ako funguje táto appka?" | "Jak funguje tato appka?" |
| `text` | "Tell us what's working well or what could be better." | "Napíšte nám, čo funguje dobre alebo čo by sa dalo zlepšiť." | "Napište nám, co funguje dobře nebo co by šlo zlepšit." |
| `inputText` | "Your feedback" | "Vaša spätná väzba" | "Vaše zpětná vazba" |
| `typeText` | "At least 4 characters" | "Aspoň 4 znaky" | "Alespoň 4 znaky" |
| `buttonOk` | "Send" | "Odoslať" | "Odeslat" |
| `buttonBack` | "Cancel" | "Zrušiť" | "Zrušit" |
| `successTitle` | "Thank you!" | "Ďakujeme!" | "Děkujeme!" |
| `successText` | "Your feedback helps us improve." | "Vaša spätná väzba nám pomáha sa zlepšovať." | "Vaše zpětná vazba nám pomáhá se zlepšovat." |
| `buttonBackMenu` | "Back to menu" | "Späť do menu" | "Zpět do menu" |

Computed: `const text = computed(() => texts[store.chosenLang] ?? texts['en'])`.

---

## 3. Backend Simplification

### `getExternalUserActionData.ts`
- Remove the entire `feedbackAction` loading block (lines ~206–225).
- Replace with: read `building.feedbackButton?.enabled`, include `feedbackButtonEnabled: boolean` in the JSON response.
- Remove `guestPlatformFeedbackQuestion` collection reference entirely.

### `schemas.ts`
- Remove `feedbackAction` field from `getExternalUserActionDataResponseSchema`.
- Add `feedbackButtonEnabled: z.boolean().optional()`.

### Building Firestore config
`feedbackButton: { enabled: true }` — no `actionId` field needed.

### `feedbackButton.http`
Remove Steps 1, 1b, 1c (collection document creation). Keep only the building-patch step, updated body:
```json
{ "feedbackButton": { "enabled": true } }
```

---

## 4. Store

`feedbackAction: null as any` → `feedbackButtonEnabled: false as boolean`.

In `ViewComponent.vue`: `store.feedbackButtonEnabled = response.data?.feedbackButtonEnabled ?? false`.

---

## 5. Empty State (NoParamsView)

**When shown:** `ViewComponent` after `state.loading = false` with no query params, no data, and no checkpoint error.

**Component:** `src/components/NoParamsView.vue`
- Centered layout, full viewport height
- ofrules logo: `src/assets/ofrules-logo.png` (copy from `/home/juraj/Pictures/logos/ofrules-long-blue.png`)
- Logo max-width: 240px
- Link below: `www.ofrules.com` → `https://www.ofrules.com` with `rel="noopener noreferrer"`
- White background, no other content

**ViewComponent template addition:**
```html
<NoParamsView v-if="!state.loading && !state.hasData && !state.errorCheckpoint" />
```
