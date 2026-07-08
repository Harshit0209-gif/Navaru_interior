export const PROPERTY_TYPES = [
  'Apartment',
  'Independent House / Villa',
  'Office / Commercial Space',
  'Retail / Showroom',
  'Restaurant / Hospitality',
  'Other',
] as const

export const DESIGN_TYPES = [
  'Full Home Interior',
  'Modular Kitchen',
  'Living Room',
  'Bedroom',
  'Single Room',
  'Office Fit-out',
  'Other',
] as const

export type PropertyType = (typeof PROPERTY_TYPES)[number]
export type DesignType = (typeof DESIGN_TYPES)[number]

export interface BookingFormValues {
  customerName: string
  phone: string
  email: string
  city: string
  state: string
  country: string
  address: string
  propertyType: string
  designType: string
  budget: string
  preferredDate: string
  message: string
  agreedToPrivacyPolicy: boolean
  // honeypot — real users never fill this in; bots that auto-fill every
  // field will trip it. Field is visually hidden, not just off-screen.
  website: string
}

export const EMPTY_BOOKING_FORM: BookingFormValues = {
  customerName: '',
  phone: '',
  email: '',
  city: '',
  state: '',
  country: '',
  address: '',
  propertyType: '',
  designType: '',
  budget: '',
  preferredDate: '',
  message: '',
  agreedToPrivacyPolicy: false,
  website: '',
}

export type BookingFormErrors = Partial<Record<keyof BookingFormValues, string>>
