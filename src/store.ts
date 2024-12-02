import { reactive } from 'vue'

const store = reactive({
  // query params
  buildingId: null as any,
  checkpointId: null as any,

  // data
  checkpointName: null as any,
  buildingData: null as any,
  viewsData: null as any,
  actionsData: null as any,
  simpleActionData: null as any,
  languages: [] as string[],

  // app state
  chosenLang: '',
  hasViewsData: false,
  isOnlySimpleAction: false,
  selectedView: null as any,
  selectedAction: null as any,
  selectedActionId: null as any,
  extUserActionId: null as any
})

export default store
