import { reactive } from 'vue'

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

  // app state
  hasViewsData: false,
  isOnlySimpleAction: false,
  selectedView: null as any,
  selectedAction: null as any,
  selectedActionId: null as any,
  extUserActionId: null as any,

  // user
  chosenLang: '',
  userRoomId: null as any,
  userPhone: localStorage.getItem('userPhone') ?? ''
})

export default store
