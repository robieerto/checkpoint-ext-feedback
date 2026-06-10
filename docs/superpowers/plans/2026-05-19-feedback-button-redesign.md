# Feedback Button Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the guest portal feedback button to be visually distinct and clearly about the app, hardcode all dialog texts, remove the `guestPlatformFeedbackQuestion` collection dependency, and add a branded empty state for direct URL access.

**Architecture:** Backend drops the Firestore collection lookup and returns a simple boolean `feedbackButtonEnabled`. Frontend hardcodes all UI text per language. A new `NoParamsView` component handles the no-URL-params empty state.

**Tech Stack:** Vue 3, Vuetify 3, TypeScript, Firebase Cloud Functions, Zod

---

## File Map

| File | Action |
|------|--------|
| `src/assets/ofrules-logo.png` | Create (copy from Pictures) |
| `src/store.ts` | Modify — rename `feedbackAction` → `feedbackButtonEnabled` |
| `src/components/FooterComponent.vue` | Modify — new button style + hardcoded label |
| `src/components/Actions/FeedbackAction.vue` | Modify — hardcode all dialog texts |
| `src/components/NoParamsView.vue` | Create — empty state with logo |
| `src/components/ViewComponent.vue` | Modify — store ref + add NoParamsView |
| `functions/checkpoint-api/src/features/externalUserActions/getExternalUserActionData.ts` | Modify — remove collection lookup, return boolean |
| `functions/checkpoint-api/src/features/externalUserActions/schemas.ts` | Modify — swap feedbackAction field for feedbackButtonEnabled |
| `http/external/feedbackButton.http` | Modify — remove collection steps |

---

## Task 1: Copy the ofrules logo into the project

**Files:**
- Create: `checkpoint-guest-portal/src/assets/ofrules-logo.png`

- [ ] **Step 1: Copy the logo**

```bash
cp /home/juraj/Pictures/logos/ofrules-long-blue.png /home/juraj/development/checkpoint/checkpoint-guest-portal/src/assets/ofrules-logo.png
```

- [ ] **Step 2: Verify it exists**

```bash
ls -lh /home/juraj/development/checkpoint/checkpoint-guest-portal/src/assets/
```

Expected: `ofrules-logo.png` listed, size ~50–200 KB.

- [ ] **Step 3: Commit**

```bash
cd /home/juraj/development/checkpoint/checkpoint-guest-portal
git add src/assets/ofrules-logo.png
git commit -m "feat: add ofrules logo asset"
```

---

## Task 2: Update the store

**Files:**
- Modify: `checkpoint-guest-portal/src/store.ts:17`

The store currently has `feedbackAction: null as any`. Replace it with `feedbackButtonEnabled: false`.

- [ ] **Step 1: Open `src/store.ts` and replace the feedbackAction field**

Replace:
```typescript
feedbackAction: null as any,
```
With:
```typescript
feedbackButtonEnabled: false,
```

The full store reactive object should now look like:
```typescript
const store = reactive({
  // query params
  buildingId: null as any,
  checkpointId: null as any,
  extFeedbackId: null as any,

  // data
  checkpointData: null as any,
  buildingData: null as any,
  viewsData: null as any,
  actionsData: null as any,
  simpleActionData: null as any,
  languages: [] as string[],
  feedbackButtonEnabled: false,

  // app state
  hasViewsData: false,
  isOnlySimpleAction: false,
  selectedView: null as any,
  selectedAction: null as any,
  selectedActionId: null as any,
  extUserActionId: null as any,
  feedbackModalOpen: false,

  // user
  chosenLang: '',
  userRoomId: null as any,
  userPhone: localStorage.getItem('userPhone') ?? '',
  userEmail: localStorage.getItem('userEmail') ?? '',

  // notifications
  notificationsEnabledForBuilding: false,
  showOrderSuccessNotification: false,
  notificationToken: localStorage.getItem('notificationToken') ?? (null as string | null),
  guestID: localStorage.getItem('guestID') ?? (null as string | null),
  buildingID: null as string | null
})
```

- [ ] **Step 2: Commit**

```bash
git add src/store.ts
git commit -m "refactor: replace feedbackAction with feedbackButtonEnabled in store"
```

---

## Task 3: Simplify the backend — remove collection lookup

**Files:**
- Modify: `checkpoint_cloud_functions/functions/checkpoint-api/src/features/externalUserActions/getExternalUserActionData.ts:205–234`

Working directory for this task: `checkpoint_cloud_functions/`

- [ ] **Step 1: Replace the feedbackAction block**

In `functions/checkpoint-api/src/features/externalUserActions/getExternalUserActionData.ts`, replace lines 205–234 (from `// Load feedback action if building has it enabled` through `feedbackAction,` in the response):

Replace:
```typescript
      // Load feedback action if building has it enabled
      let feedbackAction: ExtActionData | undefined = undefined;
      const feedbackConfig = (building as any)?.feedbackButton;
      if (feedbackConfig?.enabled !== false && feedbackConfig?.actionId) {
        try {
          feedbackAction = await getExtActionData(
            `guestPlatformFeedbackQuestion/${feedbackConfig.actionId}`
          );
        } catch (e) {
          if (e instanceof NotFoundError) {
            logger.warn(
              `feedbackButton.actionId "${feedbackConfig.actionId}" not found in /guestPlatformFeedbackQuestion`
            );
          } else {
            logger.error(
              `Failed to load feedbackAction for actionId "${feedbackConfig.actionId}"`,
              { error: e }
            );
          }
        }
      }

      response.status(200).json({
        building,
        checkpoint,
        actionData,
        viewsDataList,
        actionsDataList,
        feedbackAction,
      });
```

With:
```typescript
      const feedbackButtonEnabled = (building as any)?.feedbackButton?.enabled === true;

      response.status(200).json({
        building,
        checkpoint,
        actionData,
        viewsDataList,
        actionsDataList,
        feedbackButtonEnabled,
      });
```

- [ ] **Step 2: Build to verify no TypeScript errors**

```bash
npm run build:api
```

Expected: clean output, no errors.

- [ ] **Step 3: Commit**

```bash
git add functions/checkpoint-api/src/features/externalUserActions/getExternalUserActionData.ts
git commit -m "refactor: replace feedbackAction collection lookup with feedbackButtonEnabled boolean"
```

---

## Task 4: Update the backend response schema

**Files:**
- Modify: `checkpoint_cloud_functions/functions/checkpoint-api/src/features/externalUserActions/schemas.ts:200–203`

- [ ] **Step 1: Swap the feedbackAction field for feedbackButtonEnabled**

Replace:
```typescript
    feedbackAction: z.record(z.string(), z.unknown()).optional().openapi({
      description:
        "Feedback button action template from /guestPlatformFeedbackQuestion. Present when building has feedbackButton.enabled !== false and a valid actionId is configured.",
    }),
```

With:
```typescript
    feedbackButtonEnabled: z.boolean().optional().openapi({
      description:
        "Whether the feedback button is enabled for this building. Controlled by building.feedbackButton.enabled.",
    }),
```

- [ ] **Step 2: Build to verify no TypeScript errors**

```bash
npm run build:api
```

Expected: clean output, no errors.

- [ ] **Step 3: Commit**

```bash
git add functions/checkpoint-api/src/features/externalUserActions/schemas.ts
git commit -m "refactor: update response schema — feedbackAction → feedbackButtonEnabled"
```

---

## Task 5: Simplify feedbackButton.http

**Files:**
- Modify: `checkpoint_cloud_functions/http/external/feedbackButton.http`

Remove the three collection-creation steps (Steps 1, 1b, 1c) and the verify-action-exists request. Keep only the building-patch step and the building-verify step.

- [ ] **Step 1: Replace the entire file content**

```
### Enable feedback button on a building
# @name enableFeedbackButton
# Set enabled: true to show the feedback button, false to hide it.
# Replace `hotelOfrules` with the target buildingId.
# updateMask ensures only feedbackButton is touched — other building fields are preserved.
PATCH {{firestoreApiUrl}}/Buildings/hotelOfrules?updateMask.fieldPaths=feedbackButton
Content-Type: application/json
Authorization: Bearer owner

{
  "fields": {
    "feedbackButton": {
      "mapValue": {
        "fields": {
          "enabled": { "booleanValue": true }
        }
      }
    }
  }
}

> {%
  client.test("feedbackButton enabled on building", function() {
    client.assert(response.status === 200, "Expected 200, got " + response.status);
    client.log("✓ Buildings/hotelOfrules feedbackButton.enabled=true");
    client.log("→ Reload the guest portal to see the feedback button");
  });
%}

###

### Disable feedback button on a building
# @name disableFeedbackButton
PATCH {{firestoreApiUrl}}/Buildings/hotelOfrules?updateMask.fieldPaths=feedbackButton
Content-Type: application/json
Authorization: Bearer owner

{
  "fields": {
    "feedbackButton": {
      "mapValue": {
        "fields": {
          "enabled": { "booleanValue": false }
        }
      }
    }
  }
}

> {%
  client.test("feedbackButton disabled on building", function() {
    client.assert(response.status === 200, "Expected 200, got " + response.status);
    client.log("✓ Buildings/hotelOfrules feedbackButton.enabled=false");
  });
%}

###

### Verify: Check the building feedbackButton config
GET {{firestoreApiUrl}}/Buildings/hotelOfrules
Authorization: Bearer owner

> {%
  client.test("Building feedbackButton config", function() {
    client.assert(response.status === 200, "Building not found");
    var fields = response.body.fields;
    client.assert(fields.feedbackButton, "feedbackButton field missing — run Enable first");
    client.log("feedbackButton: " + JSON.stringify(fields.feedbackButton));
  });
%}
```

- [ ] **Step 2: Commit**

```bash
cd /home/juraj/development/checkpoint/checkpoint_cloud_functions
git add http/external/feedbackButton.http
git commit -m "refactor: simplify feedbackButton.http — remove collection steps, add disable request"
```

---

## Task 6: Redesign the footer feedback button

**Files:**
- Modify: `checkpoint-guest-portal/src/components/FooterComponent.vue`

- [ ] **Step 1: Replace FooterComponent.vue with the new implementation**

```vue
<script setup lang="ts">
import { computed } from 'vue'
import store from '@/store'

const buttonLabels: Record<string, string> = {
  sk: 'Ako funguje táto appka?',
  cz: 'Jak funguje tato appka?',
  en: 'How is this app?',
}

const label = computed(() => buttonLabels[store.chosenLang] ?? buttonLabels['en'])
</script>

<template>
  <footer>
    <div class="footer">
      <p id="checkpoint-name" class="pb-0" style="display: none">
        {{ store?.checkpointData?.name }}
      </p>
      <p v-if="store.extUserActionId" class="opacity-text mb-1">{{ store.extUserActionId }}</p>
      <v-btn
        v-if="store.feedbackButtonEnabled"
        variant="outlined"
        density="compact"
        size="small"
        class="feedback-btn mb-1"
        color="#003c69"
        prepend-icon="mdi-comment-text"
        @click="store.feedbackModalOpen = true"
      >
        {{ label }}
      </v-btn>
      <p class="opacity-text mb-0">powered by</p>
      <a href="https://www.ofrules.com" rel="noopener noreferrer">www.ofrules.com</a>
      <br />
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background-color: var(--color-background);
  text-align: center;
  padding-top: 0px;
  padding-bottom: 5px;
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
}

.feedback-btn {
  display: block;
  margin: 0 auto;
  border-radius: 100px !important;
  text-transform: none !important;
}
</style>
```

- [ ] **Step 2: Commit**

```bash
cd /home/juraj/development/checkpoint/checkpoint-guest-portal
git add src/components/FooterComponent.vue
git commit -m "feat: redesign feedback button — outlined pill with hardcoded label"
```

---

## Task 7: Hardcode FeedbackAction dialog texts

**Files:**
- Modify: `checkpoint-guest-portal/src/components/Actions/FeedbackAction.vue`

- [ ] **Step 1: Replace FeedbackAction.vue with hardcoded texts**

```vue
<script setup lang="ts">
import { reactive, computed } from 'vue'
import api from '@/services/api'
import store from '@/store'

const texts: Record<string, Record<string, string>> = {
  en: {
    title: 'How is this app working for you?',
    text: "Tell us what's working well or what could be better.",
    inputText: 'Your feedback',
    typeText: 'At least 4 characters',
    buttonOk: 'Send',
    buttonBack: 'Cancel',
    successTitle: 'Thank you!',
    successText: 'Your feedback helps us improve.',
    buttonBackMenu: 'Back to menu',
  },
  sk: {
    title: 'Ako funguje táto appka?',
    text: 'Napíšte nám, čo funguje dobre alebo čo by sa dalo zlepšiť.',
    inputText: 'Vaša spätná väzba',
    typeText: 'Aspoň 4 znaky',
    buttonOk: 'Odoslať',
    buttonBack: 'Zrušiť',
    successTitle: 'Ďakujeme!',
    successText: 'Vaša spätná väzba nám pomáha sa zlepšovať.',
    buttonBackMenu: 'Späť do menu',
  },
  cz: {
    title: 'Jak funguje tato appka?',
    text: 'Napište nám, co funguje dobře nebo co by šlo zlepšit.',
    inputText: 'Vaše zpětná vazba',
    typeText: 'Alespoň 4 znaky',
    buttonOk: 'Odeslat',
    buttonBack: 'Zrušit',
    successTitle: 'Děkujeme!',
    successText: 'Vaše zpětná vazba nám pomáhá se zlepšovat.',
    buttonBackMenu: 'Zpět do menu',
  },
}

const state = reactive({
  activeItem: 0,
  loadingBtn: false,
  inputNote: '',
  error: '',
  showError: false
})

const text = computed(() => texts[store.chosenLang] ?? texts['en'])
const isNoteValid = computed(() => state.inputNote.trim().length > 3)

const endpointUrl = `${__API_URL__}/createGuestFeedback`

const pushData = () => {
  state.loadingBtn = true

  api
    .post(endpointUrl, {
      buildingId: store.buildingId,
      note: state.inputNote.trim(),
      viewId: store.selectedView?.id ?? undefined,
      actionId: store.selectedAction?.id ?? undefined
    })
    .then(() => {
      state.activeItem = 1
    })
    .catch((error: any) => {
      state.error = error.response?.data ?? 'Error'
      state.showError = true
    })
    .finally(() => {
      state.loadingBtn = false
    })
}

const closeDialog = () => {
  store.feedbackModalOpen = false
}

const resetState = () => {
  state.activeItem = 0
  state.inputNote = ''
}
</script>

<template>
  <v-dialog v-model="store.feedbackModalOpen" max-width="480" @after-leave="resetState">
    <v-card class="pa-4">
      <!-- Step 0: Feedback form -->
      <div v-if="state.activeItem === 0">
        <v-card-title class="pb-2 px-0">{{ text.title }}</v-card-title>
        <v-card-text class="px-0 pb-1">{{ text.text }}</v-card-text>
        <v-text-field
          v-model="state.inputNote"
          :label="text.inputText"
          :hint="text.typeText"
          class="py-3"
          variant="outlined"
          type="text"
          :maxlength="1000"
        ></v-text-field>
        <v-card-actions class="px-0 justify-end">
          <v-btn variant="text" class="checkpoint-secondary-button" @click="closeDialog">
            {{ text.buttonBack }}
          </v-btn>
          <v-btn
            variant="flat"
            class="checkpoint-button"
            :loading="state.loadingBtn"
            :disabled="!isNoteValid"
            @click="pushData"
          >
            <strong>{{ text.buttonOk }}</strong>
          </v-btn>
        </v-card-actions>
      </div>

      <!-- Step 1: Success -->
      <div v-else class="text-center py-6">
        <h2 class="pb-4">{{ text.successTitle }}</h2>
        <p class="pb-6">{{ text.successText }}</p>
        <v-btn variant="flat" class="checkpoint-button" @click="closeDialog">
          {{ text.buttonBackMenu }}
        </v-btn>
      </div>
    </v-card>
  </v-dialog>
  <v-snackbar v-model="state.showError" rounded="pill">{{ state.error }}</v-snackbar>
</template>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Actions/FeedbackAction.vue
git commit -m "feat: hardcode feedback dialog texts per language, remove store.feedbackAction dependency"
```

---

## Task 8: Create NoParamsView component

**Files:**
- Create: `checkpoint-guest-portal/src/components/NoParamsView.vue`

- [ ] **Step 1: Create the component**

```vue
<script setup lang="ts">
import ofrLogo from '@/assets/ofrules-logo.png'
</script>

<template>
  <div class="no-params-view">
    <img :src="ofrLogo" alt="ofrules" class="logo" />
    <a
      href="https://www.ofrules.com"
      target="_blank"
      rel="noopener noreferrer"
      class="site-link"
    >
      www.ofrules.com
    </a>
  </div>
</template>

<style scoped>
.no-params-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
  gap: 20px;
}

.logo {
  max-width: 240px;
  width: 100%;
}

.site-link {
  font-size: 16px;
  color: var(--color-primary) !important;
}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/NoParamsView.vue
git commit -m "feat: add NoParamsView empty state with ofrules logo"
```

---

## Task 9: Wire up ViewComponent

**Files:**
- Modify: `checkpoint-guest-portal/src/components/ViewComponent.vue:39` (store ref)
- Modify: `checkpoint-guest-portal/src/components/ViewComponent.vue:116` (template)

- [ ] **Step 1: Update the store assignment in the `.then()` handler**

Replace line 39:
```typescript
store.feedbackAction = response.data?.feedbackAction ?? null
```
With:
```typescript
store.feedbackButtonEnabled = response.data?.feedbackButtonEnabled ?? false
```

- [ ] **Step 2: Add NoParamsView to the template**

The current template bottom is:
```html
    <MainView v-if="!state.loading && state.hasData" />
    <!-- <LangChooser v-if="!state.loading && state.hasData" /> -->
  </main>
```

Replace with:
```html
    <MainView v-if="!state.loading && state.hasData" />
    <!-- <LangChooser v-if="!state.loading && state.hasData" /> -->
    <NoParamsView v-if="!state.loading && !state.hasData && !state.errorCheckpoint" />
  </main>
```

`NoParamsView` is auto-imported by `unplugin-vue-components` — no manual import needed.

- [ ] **Step 3: Commit**

```bash
git add src/components/ViewComponent.vue
git commit -m "feat: wire feedbackButtonEnabled from API response, add NoParamsView for empty state"
```

---

## Task 10: Verify everything works

- [ ] **Step 1: Start the Firebase emulators (if not already running)**

```bash
cd /home/juraj/development/checkpoint/checkpoint_cloud_functions
./run-emulators.sh
```

- [ ] **Step 2: Start the guest portal dev server**

```bash
cd /home/juraj/development/checkpoint/checkpoint-guest-portal
npm run dev
```

- [ ] **Step 3: Verify the empty state**

Open `http://localhost:4173/` with no query params.
Expected: ofrules logo centered on the page with `www.ofrules.com` link. No spinner, no blank page.

- [ ] **Step 4: Enable feedback button via HTTP file**

Run the `Enable feedback button on a building` request in `http/external/feedbackButton.http` (with `local` environment selected).
Expected: 200 OK.

- [ ] **Step 5: Verify the portal with params**

Open `http://localhost:4173/?extFeedbackId=default&buildingId=hotelOfrules&checkpointId=0lTrMFzcnDQRarDRH96V`.
Expected:
- Feedback button visible in footer: outlined navy pill, `mdi-comment-text` icon, label in the building's language
- Clicking the button opens the FeedbackAction dialog with the hardcoded texts
- Submitting feedback (text ≥ 4 chars) shows the success screen
- Dialog closes and resets after clicking back to menu

- [ ] **Step 6: Verify disabled state**

Run the `Disable feedback button on a building` request.
Reload the portal — feedback button should disappear.
