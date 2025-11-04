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

/**
 * Base interface for common fields across all action language types
 */
export interface BaseActionLanguage {
  // Core navigation
  buttonOk: string
  buttonBack: string
  buttonBackMenu: string
  buttonCTA?: string

  // Success state
  successTitle: string
  successText: string
  successTexts?: string[]
  successText2?: string

  // Cancel state (optional)
  cancelTitle?: string
  cancelText?: string

  // List view (for menu display)
  listTitle?: string
  listText?: string
  listTexts?: string[]
  listBottomText?: string
  listCTAButton?: string
  listLinks?: Array<{
    text: string
    url: string
  }>

  // Optional description
  description?: string
}

export interface Building {
  name: string
  language: string
  website?: string
  googleUrl?: string
}

export interface OccurenceAction extends BaseActionLanguage {
  title: string
  text: string
}

export interface OrderAction extends BaseActionLanguage {
  // Form fields
  title: string
  text: string
  texts?: string[]
  bottomText?: string
  inputText?: string

  // CTA
  ctaText?: string

  // Reservation
  reservation?: string
  reservationText?: string
  reservationFull?: string

  // Phone input
  phoneText?: string
  phoneInput?: string
  typePhone?: string
  errorPhone: string

  // Email input
  emailText?: string
  emailInput?: string
  typeEmail?: string
  errorEmail: string

  // Note input
  noteText?: string
  noteInput?: string
  typeNote?: string
  errorNote: string

  // Second note
  noteText2?: string
  noteInput2?: string
  typeNote2?: string
  errorNote2: string

  // Number input
  numberInputText?: string
  typeNumberText?: string

  // String input
  stringInputText?: string
  labelText?: string

  // Selection
  selectionText?: string
  selectOptions?: string[]

  // Checkboxes
  checkboxes?: string[]
  checkboxesTexts?: string[]
}

export interface QuestionAction extends BaseActionLanguage {
  title: string
  text: string
  secondTitle: string
  secondText: string
  buttonNext: string

  // Question input
  inputQuestionText: string
  typeQuestionText: string
  requiredText: string

  // Contact fields
  phoneText: string
  typePhone: string
  errorPhone: string

  mailText: string
  typeEmail: string
  errorEmail: string
}

/**
 * Structure for questionnaire items in reviews
 */
export interface ReviewQuestionItem {
  question: string
  answers: string[]
  allowOther?: boolean
  otherText?: string
}

export interface ReviewAction extends BaseActionLanguage {
  title: string
  text: string
  buttonNext: string

  // Rating
  requiredScore: string

  // Input
  inputText: string
  typeText: string

  // Email (optional)
  mailText?: string
  typeEmail?: string
  errorEmail: string

  // Contact based on rating
  contactPositiveTitle?: string
  contactPositiveText?: string
  contactNegativeTitle?: string
  contactNegativeText?: string

  // Questionnaire
  textQuestion?: string
  positiveQuestions?: ReviewQuestionItem[]
  negativeQuestions?: ReviewQuestionItem[]
}

/**
 * Link action for external navigation and information display
 * Only uses list view fields from BaseActionLanguage (no form fields)
 */
export interface LinkAction extends BaseActionLanguage {
  // Link actions only use inherited list view fields:
  // - listTitle
  // - listText
  // - listTexts
  // - listBottomText
  // - listCTAButton
  // - listLinks
}

export interface ReservationTime {
  start: string
  end: string
  dateReserved: string
  type: string
}
