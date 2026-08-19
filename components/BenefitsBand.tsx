import { Clock, HeartHandshake, Leaf, Tag } from 'lucide-react'

const benefits = [
  { icon: Tag, label: 'Precios bajos', description: 'Todos los días, sin sorpresas' },
  { icon: Leaf, label: 'Productos frescos', description: 'Calidad que se nota' },
  { icon: HeartHandshake, label: 'Atención cercana', description: 'Como en el barrio' },
  { icon: Clock, label: 'Siempre cerca', description: 'La sucursal que te queda a mano' },
]

export default function BenefitsBand() {
  return (
    <section className="bg-homex-blue py-12 lg:py-16">
      <div className="mx-auto grid w-full max-w-[1400px] grid-cols-2 gap-6 px-5 md:px-8 lg:grid-cols-4 lg:px-16">
        {benefits.map(({ icon: Icon, label, description }) => (
          <div key={label} className="flex flex-col items-center gap-2 text-center sm:flex-row sm:text-left">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-homex-yellow/15">
              <Icon className="h-6 w-6 text-homex-yellow" strokeWidth={2} aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-semibold text-white">{label}</p>
              <p className="text-xs text-white/70">{description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
