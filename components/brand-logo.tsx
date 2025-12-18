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
  priority = false,
}: BrandLogoProps) {
  const wrapperClass =
    variant === 'dark'
      ? 'rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm p-1 shadow-glow'
      : variant === 'light'
        ? 'rounded-xl bg-white border border-slate-200 p-1 shadow-sm'
        : ''

  return (
    <div className={cn('flex items-center gap-2 min-w-0', className)}>
      <div className={cn('shrink-0', wrapperClass)}>
        <Image
          src="/logo.png"
          alt="GiderSE-Gelir"
          width={size}
          height={size}
          priority={priority}
          unoptimized
          className="rounded-lg"
        />
      </div>
      {withText && (
        <span className={cn('truncate font-bold text-lg', textClassName)}>GiderSE-Gelir</span>
      )}
    </div>
  )
}
