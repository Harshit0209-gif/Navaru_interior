import { useSiteSettings } from '../../context/SiteSettingsContext'
import { WhatsAppIcon } from '../Icons/BrandIcons'

export function WhatsAppButton() {
  const { whatsapp_number: whatsappNumber, company_name: companyName } = useSiteSettings()

  if (!whatsappNumber) return null

  const digits = whatsappNumber.replace(/[^\d]/g, '')

  return (
    <a
      href={`https://wa.me/${digits}`}
      target="_blank"
      rel="noreferrer"
      aria-label={`Chat with ${companyName} on WhatsApp`}
      className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform duration-300 hover:scale-105"
    >
      <WhatsAppIcon className="h-7 w-7" />
    </a>
  )
}
