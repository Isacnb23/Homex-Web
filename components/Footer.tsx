import type { SVGProps } from 'react'
import Link from 'next/link'
import { MessageCircle } from 'lucide-react'

function FacebookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M22 12.06C22 6.51 17.52 2 12 2S2 6.51 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.91h2.54V9.84c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.44 2.91h-2.34v7.03C18.34 21.21 22 17.06 22 12.06Z" />
    </svg>
  )
}

function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.3" cy="6.7" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  )
}

const socialLinks = [
  { name: 'Facebook', href: '#', Icon: FacebookIcon },
  { name: 'Instagram', href: '#', Icon: InstagramIcon },
  { name: 'WhatsApp', href: '#', Icon: MessageCircle },
]

export default function Footer() {
  return (
    <footer id="footer" className="bg-homex-blue-dark py-8">
      <div className="mx-auto flex w-full max-w-[1400px] flex-col items-center gap-6 px-5 text-center md:flex-row md:justify-between md:px-8 md:text-left lg:px-16">
        <Link href="/" className="flex flex-col leading-none">
          <span className="text-xl font-extrabold">
            <span className="text-white">Home</span>
            <span className="text-homex-yellow">X</span>
          </span>
          <span className="mt-0.5 text-[9px] font-semibold tracking-[0.2em] text-white/70">
            SUPERMERCADO
          </span>
        </Link>

        <p className="text-sm text-white/70">
          © 2026 HomeX Supermercado. Todos los derechos reservados.
        </p>

        <div className="flex items-center gap-3">
          {socialLinks.map(({ name, href, Icon }) => (
            <a
              key={name}
              href={href}
              aria-label={name}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-homex-yellow text-homex-blue-dark transition-all duration-300 hover:-translate-y-0.5 hover:bg-homex-yellow-dark hover:shadow-button"
            >
              <Icon className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
            </a>
          ))}
        </div>
      </div>
    </footer>
  )
}
