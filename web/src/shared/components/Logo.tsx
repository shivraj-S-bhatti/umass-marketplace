import { Link } from 'react-router-dom'
import LogoIcon from '@/assets/logo-icon.svg'

/**
 * Logo Component - Everything UMass branding
 * Displays the logo icon and text
 * Responsive sizing for mobile and desktop
 */
export default function Logo() {
  return (
    <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity flex-shrink-0 min-w-0">
      <img 
        src={LogoIcon} 
        alt="Everything UMass Logo" 
        className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0" 
      />
      <span className="text-lg sm:text-xl font-bold tracking-tight whitespace-nowrap">Everything UMass</span>
    </Link>
  )
}

