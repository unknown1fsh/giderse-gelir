'use client'

import { Card, CardContent, CardHeader, Skeleton } from '@/components/mosaic'

export default function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Card
        variant="premium"
        className="overflow-hidden border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.18),_transparent_26%),linear-gradient(135deg,rgba(15,23,42,0.98),rgba(17,24,39,0.96))]"
      >
        <CardContent className="p-6 sm:p-8">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_320px]">
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <Skeleton className="h-14 w-14 rounded-2xl bg-white/10" />
                <div className="space-y-3">
                  <Skeleton className="h-4 w-24 bg-white/10" />
                  <Skeleton className="h-10 w-56 bg-white/10" />
                  <Skeleton className="h-4 w-72 bg-white/10" />
                </div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <Skeleton className="h-3 w-32 bg-white/10" />
                <Skeleton className="mt-4 h-12 w-64 bg-white/10" />
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  {[1, 2, 3].map(item => (
                    <div key={item} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                      <Skeleton className="h-3 w-16 bg-white/10" />
                      <Skeleton className="mt-3 h-6 w-24 bg-white/10" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
              <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                <Skeleton className="h-4 w-32 bg-white/10" />
                <Skeleton className="mx-auto mt-5 h-32 w-32 rounded-full bg-white/10" />
                <Skeleton className="mx-auto mt-4 h-6 w-24 bg-white/10" />
              </div>
              <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                <Skeleton className="h-24 w-full rounded-2xl bg-white/10" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map(item => (
          <Card key={item} variant="premium" className="border-white/10 bg-white/5">
            <CardContent className="p-5">
              <Skeleton className="h-10 w-10 rounded-2xl bg-white/10" />
              <Skeleton className="mt-4 h-5 w-24 bg-white/10" />
              <Skeleton className="mt-2 h-4 w-40 bg-white/10" />
              <Skeleton className="mt-4 h-3 w-28 bg-white/10" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map(item => (
          <Card key={item} variant="premium" className="border-white/10 bg-card/95">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24 bg-white/10" />
                <Skeleton className="h-10 w-10 rounded-xl bg-white/10" />
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-28 bg-white/10" />
              <Skeleton className="mt-2 h-3 w-32 bg-white/10" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {[1, 2].map(item => (
          <Card key={item} variant="premium" className="border-white/10 bg-card/95">
            <CardHeader className="border-b border-white/10">
              <Skeleton className="h-5 w-32 bg-white/10" />
              <Skeleton className="h-4 w-52 bg-white/10" />
            </CardHeader>
            <CardContent className="space-y-3 p-5">
              {[1, 2, 3].map(row => (
                <div key={row} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <Skeleton className="h-4 w-36 bg-white/10" />
                  <Skeleton className="mt-2 h-3 w-24 bg-white/10" />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
