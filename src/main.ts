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
