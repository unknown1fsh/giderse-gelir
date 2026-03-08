import * as React from 'react'
import { cn } from '@/lib/utils'

const Modal = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & {
        open?: boolean
        onOpenChange?: (open: boolean) => void
    }
>(({ className, open, onOpenChange, ...props }, ref) => {
    const [isOpen, setIsOpen] = React.useState(open || false)

    React.useEffect(() => {
        if (open !== undefined) {
            setIsOpen(open)
        }
    }, [open])

    const handleOpenChange = (newOpen: boolean) => {
        setIsOpen(newOpen)
        onOpenChange?.(newOpen)
    }

    if (!isOpen) {
        return null
    }

    return (
        <>
            <div
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={() => handleOpenChange(false)}
            />
            <div
                ref={ref}
                className={cn('fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4 sm:p-0', className)}
                {...props}
            />
        </>
    )
})
Modal.displayName = 'Modal'

const ModalContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, children, ...props }, ref) => (
        <div
            ref={ref}
            className={cn(
                'relative z-50 grid w-full max-w-lg gap-4 border border-border bg-background p-6 shadow-xl rounded-2xl pointer-events-auto max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200',
                className
            )}
            {...props}
        >
            {children}
        </div>
    )
)
ModalContent.displayName = 'ModalContent'

const ModalHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            className={cn('flex flex-col space-y-1.5 text-center sm:text-left', className)}
            {...props}
        />
    )
)
ModalHeader.displayName = 'ModalHeader'

const ModalTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
    ({ className, ...props }, ref) => (
        <h2
            ref={ref}
            className={cn('text-xl font-semibold leading-none tracking-tight text-foreground', className)}
            {...props}
        />
    )
)
ModalTitle.displayName = 'ModalTitle'

const ModalDescription = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
    <p ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
))
ModalDescription.displayName = 'ModalDescription'

const ModalFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 pt-4 border-t border-border mt-2', className)}
            {...props}
        />
    )
)
ModalFooter.displayName = 'ModalFooter'

export { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription, ModalFooter }
