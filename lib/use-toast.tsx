'use client'

import * as React from 'react'

type ToastType = 'default' | 'success' | 'error' | 'warning'

interface Toast {
    id: string
    title?: string
    description?: string
    type?: ToastType
}

interface ToastContextType {
    toasts: Toast[]
    addToast: (toast: Omit<Toast, 'id'>) => void
    removeToast: (id: string) => void
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = React.useState<Toast[]>([])

    const addToast = React.useCallback((toast: Omit<Toast, 'id'>) => {
        const id = Math.random().toString(36).substring(7)
        setToasts(prev => [...prev, { ...toast, id }])

        // Auto-remove after 5 seconds
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id))
        }, 5000)
    }, [])

    const removeToast = React.useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id))
    }, [])

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    )
}

function ToastContainer({ toasts, removeToast }: { toasts: Toast[]; removeToast: (id: string) => void }) {
    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md">
            {toasts.map(toast => (
                <div
                    key={toast.id}
                    className={`
            p-4 rounded-lg shadow-lg border animate-in slide-in-from-right-full fade-in duration-200
            ${toast.type === 'error'
                            ? 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200'
                            : toast.type === 'success'
                                ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200'
                                : toast.type === 'warning'
                                    ? 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200'
                                    : 'bg-white border-gray-200 text-gray-800 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200'
                        }
          `}
                >
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                            {toast.title && (
                                <div className="font-semibold text-sm">{toast.title}</div>
                            )}
                            {toast.description && (
                                <div className="text-sm opacity-90 mt-1">{toast.description}</div>
                            )}
                        </div>
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="text-current opacity-50 hover:opacity-100 transition-opacity"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            ))}
        </div>
    )
}

export function useToast() {
    const context = React.useContext(ToastContext)
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider')
    }

    return {
        toast: context.addToast,
        success: (title: string, description?: string) =>
            context.addToast({ title, description, type: 'success' }),
        error: (title: string, description?: string) =>
            context.addToast({ title, description, type: 'error' }),
        warning: (title: string, description?: string) =>
            context.addToast({ title, description, type: 'warning' }),
        dismiss: context.removeToast,
    }
}
