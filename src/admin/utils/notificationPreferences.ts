// Per-browser preferences (same convention as the admin theme toggle and
// "Remember Me") controlling whether the realtime "new booking" / "new
// enquiry" toast fires on the Bookings/Contact list pages. Defaults to on
// so existing behavior is unchanged until an admin turns one off.

const BOOKINGS_KEY = 'navaru-admin-notify-bookings'
const CONTACT_KEY = 'navaru-admin-notify-contact'

function readFlag(key: string): boolean {
  try {
    const raw = window.localStorage.getItem(key)
    return raw === null ? true : raw === 'true'
  } catch {
    return true
  }
}

function writeFlag(key: string, value: boolean): void {
  try {
    window.localStorage.setItem(key, String(value))
  } catch {
    // ignore — preference just won't persist
  }
}

export function getNotifyOnNewBookings(): boolean {
  return readFlag(BOOKINGS_KEY)
}

export function setNotifyOnNewBookings(value: boolean): void {
  writeFlag(BOOKINGS_KEY, value)
}

export function getNotifyOnNewEnquiries(): boolean {
  return readFlag(CONTACT_KEY)
}

export function setNotifyOnNewEnquiries(value: boolean): void {
  writeFlag(CONTACT_KEY, value)
}
