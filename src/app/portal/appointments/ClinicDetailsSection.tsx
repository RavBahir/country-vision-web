import { Card } from '@/components/portal/UI'
import { CLINIC } from '@/lib/portal-data'
import { Clock, MapPin, Phone } from 'lucide-react'

const ClinicDetailsSection = () => {
  return (
    <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold">Clinic details</h2>
            <ul className="mt-4 grid gap-4 text-sm">
              <li className="flex gap-3">
                <MapPin size={16} className="mt-0.5 shrink-0 text-[#8A6A4A]" />
                <span>
                  <b className="block font-medium">{CLINIC.name}</b>
                  <span className="text-[#1F1A15]/60">{CLINIC.address}</span>
                </span>
              </li>
              <li className="flex gap-3">
                <Clock size={16} className="mt-0.5 shrink-0 text-[#8A6A4A]" />
                <span>{CLINIC.hours}</span>
              </li>
              <li className="flex gap-3">
                <Phone size={16} className="mt-0.5 shrink-0 text-[#8A6A4A]" />
                <a href={`tel:${CLINIC.phone}`}>{CLINIC.phone}</a>
              </li>
            </ul>
          </Card>
          <div className="rounded-3xl bg-[#12100D] p-6 text-white">
            <h2 className="text-lg font-semibold">Before your visit</h2>
            <ul className="mt-4 grid gap-3 text-sm text-white/70">
              {[
                "Bring your current glasses or lenses",
                "Note any headaches or blurred vision",
                "List medication you take regularly",
                "Arrive 10 minutes early",
              ].map((t) => (
                <li key={t} className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#C9A57B]" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
  )
}

export default ClinicDetailsSection