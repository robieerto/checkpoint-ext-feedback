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
  buttokOk: string
  buttonBack: string
  successTitle: string
  successText: string
  text: string
  buttonCTA: string
}
export interface Building {
  name: string
  website: string
}
