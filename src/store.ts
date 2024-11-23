import { reactive } from 'vue'

const store = reactive({
  // query params
  buildingId: null as any,
  checkpointId: null as any,
  extFeedbackId: null as any,
  extActionId: null as any,

  // data
  checkpointName: null as any,
  buildingData: null as any,
  actionData: null as any,
  feedbackData: null as any,
  languages: [] as string[],

  // app state
  chosenLang: '',
  selectedActionId: null as any,
  selectedActionType: null as any,
  extUserActionId: null as any
})

export default store
