export interface AssociativeArray {
  [key: string]: Object
}

export interface ExtFeedbackAction {
  actionTexts: ActionTextsEntity[]
  building: Building
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
  website: string
  language: string
}
