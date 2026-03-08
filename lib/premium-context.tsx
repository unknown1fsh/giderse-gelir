'use client'

import React, { createContext, useContext, useState } from 'react'
import PremiumUpgradeModal from '@/components/premium-upgrade-modal'

interface PremiumModalContextType {
    showModal: (featureName: string, limitInfo?: any) => void
    hideModal: () => void
}

const PremiumModalContext = createContext<PremiumModalContextType | undefined>(undefined)

export function PremiumModalProvider({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false)
    const [featureName, setFeatureName] = useState('Premium Özellik')
    const [limitInfo, setLimitInfo] = useState<any>(undefined)

    const showModal = (name: string, info?: any) => {
        setFeatureName(name)
        setLimitInfo(info)
        setIsOpen(true)
    }

    const hideModal = () => {
        setIsOpen(false)
    }

    return (
        <PremiumModalContext.Provider value={{ showModal, hideModal }}>
            {children}
            <PremiumUpgradeModal
                isOpen={isOpen}
                onClose={hideModal}
                featureName={featureName}
                limitInfo={limitInfo}
            />
        </PremiumModalContext.Provider>
    )
}

export function usePremiumModal() {
    const context = useContext(PremiumModalContext)
    if (context === undefined) {
        throw new Error('usePremiumModal must be used within a PremiumModalProvider')
    }
    return context
}
