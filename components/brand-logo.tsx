import { cn } from '@/lib/utils'

type BrandLogoProps = {
  size?: number
  withText?: boolean
  variant?: 'none' | 'light' | 'dark'
  className?: string
  textClassName?: string
  priority?: boolean
}

export default function BrandLogo({
  size = 32,
  withText = true,
  variant = 'none',
  className,
  textClassName,
}: BrandLogoProps) {
  const wrapperClass =
    variant === 'dark'
      ? 'rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm p-2 shadow-glow'
      : variant === 'light'
        ? 'rounded-xl bg-white border border-slate-200 p-2 shadow-sm'
        : 'p-1'

  return (
    <div className={cn('flex items-center gap-2 min-w-0 transition-all duration-300 hover:scale-[1.02]', className)}>
      <div className={cn('shrink-0 relative group flex items-center justify-center', wrapperClass)} style={{ width: size + 8, height: size + 8 }}>
        {/* Glow effect behind logo */}
        <div className="absolute inset-0 bg-gradient-to-tr from-premium-500/20 to-finance-500/20 rounded-xl blur-md group-hover:blur-lg transition-all duration-300 opacity-0 group-hover:opacity-100" />
        
        <svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10 transform transition-transform duration-500 group-hover:rotate-3 group-hover:scale-105"
        >
          {/* Definitions for Gradients */}
          <defs>
            <linearGradient id="finance-gradient" x1="20" y1="80" x2="80" y2="20" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#22c55e" /> {/* finance-500 */}
              <stop offset="100%" stopColor="#86efac" /> {/* finance-300 */}
            </linearGradient>
            <linearGradient id="expense-gradient" x1="10" y1="10" x2="50" y2="90" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ef4444" /> {/* expense-500 */}
              <stop offset="100%" stopColor="#fca5a5" /> {/* expense-300 */}
            </linearGradient>
            <linearGradient id="premium-gradient" x1="0" y1="50" x2="100" y2="50" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#a855f7" /> {/* premium-500 */}
              <stop offset="100%" stopColor="#d8b4fe" /> {/* premium-300 */}
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Track */}
          <path
            d="M30 75C30 75 45 60 70 65"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            className="text-slate-200 dark:text-slate-700/50"
          />

          {/* Premium Base / Core (Purple) */}
          <rect x="25" y="35" width="24" height="40" rx="8" fill="url(#premium-gradient)" opacity="0.6" className="animate-pulse-slow" />

          {/* Expense Element (Red/Pink Downward implied but styled beautifully) */}
          <path
            d="M50 35C50 25 60 15 70 15C80 15 85 25 85 35C85 45 70 65 70 65C70 65 50 45 50 35Z"
            fill="url(#expense-gradient)"
            opacity="0.9"
          />
          
          {/* Finance/Income Element (Green Upward Growth) */}
          <path
            d="M15 65C15 75 25 85 35 85C45 85 50 75 50 65C50 55 35 35 35 35C35 35 15 55 15 65Z"
            fill="url(#finance-gradient)"
            filter="url(#glow)"
          />

          {/* Central Connecting Node / Tech Dot */}
          <circle cx="52" cy="48" r="6" fill="white" className="dark:fill-slate-900" />
          <circle cx="52" cy="48" r="3" fill="url(#premium-gradient)" />
        </svg>
      </div>
      {withText && (
        <span className={cn('truncate font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300', textClassName)}>
          GiderSE<span className="text-finance-500 font-black">-</span>Gelir
        </span>
      )}
    </div>
  )
}
