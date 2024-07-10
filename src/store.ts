import { reactive } from 'vue'

const store = reactive({
  extFeedbackActionId: null,
  chosenLang: '',
  compoundAction: false,
  selectedActionId: null,
  selectedActionType: null
})

export default store
