import Image from 'next/image'
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
  priority,
}: BrandLogoProps) {
  const wrapperBg =
    variant === 'dark'
      ? 'rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm p-1.5 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
      : variant === 'light'
        ? 'rounded-xl bg-white border border-slate-200 p-1.5 shadow-sm'
        : 'p-0.5'

  return (
    <div className={cn('flex items-center gap-2.5 min-w-0 transition-all duration-300 hover:scale-[1.02]', className)}>
      {/* Logo Icon */}
      <div
        className={cn('shrink-0 relative group flex items-center justify-center', wrapperBg)}
        style={{ width: size + 6, height: size + 6 }}
      >
        {/* Glow effect behind logo on hover */}
        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/25 to-violet-500/15 rounded-xl blur-md group-hover:blur-lg transition-all duration-500 opacity-0 group-hover:opacity-100" />

        <Image
          src="/logo.svg"
          alt="GiderSE-Gelir"
          width={size}
          height={size}
          priority={priority}
          className="relative z-10 transform transition-transform duration-500 group-hover:rotate-3 group-hover:scale-105"
        />
      </div>

      {/* Brand Text - Handwriting style */}
      {withText && (
        <span
          className={cn(
            'truncate font-handwriting font-bold tracking-tight',
            'text-xl',
            variant === 'dark' || variant === 'none'
              ? 'text-transparent bg-clip-text bg-gradient-to-r from-white via-emerald-200 to-white'
              : 'text-transparent bg-clip-text bg-gradient-to-r from-slate-800 via-emerald-700 to-slate-800',
            textClassName
          )}
        >
          <span className="text-emerald-400 font-extrabold">G</span>
          iderSE
          <span className="text-violet-400 font-extrabold mx-[1px]">—</span>
          <span className="text-emerald-400 font-extrabold">G</span>
          elir
        </span>
      )}
    </div>
  )
}
