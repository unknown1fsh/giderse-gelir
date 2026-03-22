import { Suspense } from 'react'
import { Spinner } from '@/components/mosaic'
import { CardsContent } from './cards-content'

export default function CardsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><Spinner /></div>}>
      <CardsContent />
    </Suspense>
  )
}
