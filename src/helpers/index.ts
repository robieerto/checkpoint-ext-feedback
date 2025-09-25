import phone from 'phone'

export const validatePhone = (inputPhone: string) => {
  // Allow only digits and common phone symbols
  if (/[^0-9+\-\s()]/.test(inputPhone)) return false
  const phoneValidationResult = phone(inputPhone, { validateMobilePrefix: false })
  return phoneValidationResult.isValid || !inputPhone.length
}

export const validateEmail = (inputEmail: string) => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailPattern.test(inputEmail) || !inputEmail.length
}
