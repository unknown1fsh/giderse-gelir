import * as React from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from './button'
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription, ModalFooter } from './modal'

export interface ConfirmDialogProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => Promise<void> | void
    title: string
    message: string
    warningMessage?: string
    confirmText?: string
    cancelText?: string
    variant?: 'danger' | 'warning' | 'primary'
    loading?: boolean
}

export function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    warningMessage,
    confirmText = 'Onayla',
    cancelText = 'İptal',
    variant = 'danger',
    loading = false,
}: ConfirmDialogProps) {
    const [internalLoading, setInternalLoading] = React.useState(false)

    const handleConfirm = async () => {
        setInternalLoading(true)
        try {
            await onConfirm()
            onClose()
        } catch (error) {
            console.error('Confirm error:', error)
        } finally {
            setInternalLoading(false)
        }
    }

    const isExecuting = loading || internalLoading

    const variantBtnMap = {
        danger: 'destructive',
        warning: 'default', // standard button maybe styled via cn? Actually default is fine, typically warning is yellow/redish
        primary: 'default',
    } as const

    return (
        <Modal open={isOpen} onOpenChange={onClose}>
            <ModalContent className="max-w-md">
                <ModalHeader className="flex flex-row items-center gap-3">
                    <div className={`p-2 rounded-full shrink-0 ${variant === 'danger' ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
                        <AlertTriangle className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                        <ModalTitle>{title}</ModalTitle>
                    </div>
                </ModalHeader>

                <div className="py-2 space-y-4 text-sm text-foreground">
                    <ModalDescription className="text-base text-foreground">
                        {message}
                    </ModalDescription>

                    {warningMessage && (
                        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                            <p className="text-sm font-medium text-amber-500">⚠️ {warningMessage}</p>
                        </div>
                    )}
                </div>

                <ModalFooter>
                    <Button variant="outline" onClick={onClose} disabled={isExecuting} className="w-full sm:w-auto">
                        {cancelText}
                    </Button>
                    <Button
                        variant={variantBtnMap[variant]}
                        onClick={handleConfirm}
                        loading={isExecuting}
                        className="w-full sm:w-auto"
                    >
                        {confirmText}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}
