import { Link } from 'react-router-dom'
import LogoIcon from '@/assets/logo-icon.svg'

/**
 * Logo Component - Everything UMass branding
 * Displays the logo icon; optionally with "Everything UMass" text.
 * Use iconOnly in the main navbar to avoid duplicating the text (Layout shows it once).
 */
interface LogoProps {
  /** When true, only the icon is shown (e.g. in navbar where Layout adds "Everything UMass") */
  iconOnly?: boolean
}

export default function Logo({ iconOnly = false }: LogoProps) {
  return (
    <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity flex-shrink-0 min-w-0" aria-label="Everything UMass Home">
      <img
        src={LogoIcon}
        alt=""
        className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0"
      />
      {!iconOnly && (
        <span className="font-brand text-lg sm:text-xl font-bold tracking-tight whitespace-nowrap">Everything UMass</span>
      )}
    </Link>
  )
}

