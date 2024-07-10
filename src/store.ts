import { reactive } from 'vue'

const store = reactive({
  extFeedbackActionId: null,
  chosenLang: '',
  isCompoundAction: false,
  selectedActionId: null,
  selectedActionType: null
})

export default store
