export interface ContactFormValues {
  name: string
  email: string
  phone: string
  subject: string
  message: string
  website: string // honeypot, see booking.ts
}

export const EMPTY_CONTACT_FORM: ContactFormValues = {
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
  website: '',
}

export type ContactFormErrors = Partial<Record<keyof ContactFormValues, string>>
