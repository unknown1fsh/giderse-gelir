import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'

const cardVariants = cva(
    'rounded-2xl border bg-card text-card-foreground transition-all duration-300',
    {
        variants: {
            variant: {
                default: 'shadow-sm hover:shadow-md border-border',
                glass: 'glass hover:bg-white/90 border-border/50',
                premium: 'glass-card hover:shadow-premium hover:scale-[1.01] border-border/50',
                glow: 'shadow-card hover:shadow-glow-lg hover:scale-[1.01] border-border',
                flat: 'shadow-none border-border',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    }
)

export interface CardProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
    className?: string
    children: React.ReactNode
}

export function Card({ className, variant, children, ...props }: CardProps) {
    return (
        <div className={cn(cardVariants({ variant }), className)} {...props}>
            {children}
        </div>
    )
}

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> { }

export function CardHeader({ className, children, ...props }: CardHeaderProps) {
    return (
        <div className={cn('flex flex-col space-y-1.5 p-6 pb-4', className)} {...props}>
            {children}
        </div>
    )
}

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> { }

export function CardTitle({ className, children, ...props }: CardTitleProps) {
    return (
        <h3 className={cn('text-xl font-semibold leading-none tracking-tight text-foreground', className)} {...props}>
            {children}
        </h3>
    )
}

export interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> { }

export function CardDescription({ className, children, ...props }: CardDescriptionProps) {
    return (
        <p className={cn('text-sm text-muted-foreground', className)} {...props}>
            {children}
        </p>
    )
}

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> { }

export function CardContent({ className, children, ...props }: CardContentProps) {
    return (
        <div className={cn('p-6 pt-0', className)} {...props}>
            {children}
        </div>
    )
}

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> { }

export function CardFooter({ className, children, ...props }: CardFooterProps) {
    return (
        <div className={cn('flex items-center p-6 pt-0 mt-auto', className)} {...props}>
            {children}
        </div>
    )
}

/** Specialized Pre-composed Cards */

export interface StatCardProps extends Omit<CardProps, 'title' | 'children'> {
    title: string
    value: string | number
    icon?: React.ReactNode
    description?: string
    trend?: {
        value: number
        label: string
        isPositive?: boolean
    }
}

export function StatCard({ title, value, icon, description, trend, variant = 'default', className, ...props }: StatCardProps) {
    return (
        <Card variant={variant} className={cn('flex flex-col', className)} {...props}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                {icon && <div className="text-muted-foreground">{icon}</div>}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-foreground">{value}</div>
                {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
                {trend && (
                    <div className="flex items-center mt-2 text-xs">
                        <span className={cn('font-medium', trend.isPositive ? 'text-green-500' : 'text-destructive')}>
                            {trend.isPositive ? '+' : ''}{trend.value}%
                        </span>
                        <span className="text-muted-foreground ml-1">{trend.label}</span>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
