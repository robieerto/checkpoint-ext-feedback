export interface AssociativeArray {
  [key: string]: Object
}

export interface ExtFeedbackAction {
  building: Building
  checkpointName: string
  actionData: any[]
  compoundActionList?: any[]
  actionType: string
}

export interface ActionTextsEntity {
  lang: string
  texts: Texts
}

export interface Texts {
  title: string
  buttonOk: string
  buttonBack: string
  successTitle: string
  successText: string
  cancelTitle: string
  cancelText: string
  text: string
  buttonCTA: string
}

export interface Building {
  name: string
  language: string
  website?: string
  googleUrl?: string
}

export interface OccurenceAction {
  description?: string
  buttonBack: string
  buttonBackMenu: string
  buttonCTA: string
  buttonOk: string
  cancelText: string
  cancelTitle: string
  successText: string
  successText2: string
  successTitle: string
  text: string
  title: string
}

export interface OrderAction {
  description?: string
  buttonBack: string
  buttonBackMenu: string
  buttonCTA: string
  buttonOk: string
  cancelText: string
  inputText: string
  successText: string
  successText2: string
  successTitle: string
  text: string
  texts: [string]
  title: string
  typeText: string
  bottomText: string
  selectOptions?: string[]
  checkboxes?: string[]
}

export interface QuestionAction {
  description?: string
  buttonBack: string
  buttonBackMenu: string
  buttonCTA: string
  buttonOk: string
  buttonNext: string
  cancelText: string
  cancelTitle: string
  inputQuestionText: string
  mailText: string
  phoneText: string
  secondText: string
  secondTitle: string
  successText: string
  successText2: string
  successTitle: string
  text: string
  title: string
  typeEmail: string
  typePhone: string
  typeQuestionText: string
  requiredText: string
  errorEmail: string
  errorPhone: string
}

export interface ReviewAction {
  description?: string
  buttonBack: string
  buttonBackMenu: string
  buttonCTA: string
  buttonOk: string
  cancelText: string
  cancelTitle: string
  inputText: string
  successText: string
  successTitle: string
  text: string
  title: string
  typeText: string
  requiredScore: string
}
