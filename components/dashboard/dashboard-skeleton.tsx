'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      {/* User Welcome Card Skeleton */}
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-lg border border-slate-200/60">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-full bg-slate-200 animate-pulse"></div>
              <div>
                <div className="h-6 w-48 bg-slate-200 rounded animate-pulse mb-2"></div>
                <div className="h-4 w-64 bg-slate-200 rounded animate-pulse"></div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-8 w-24 bg-slate-200 rounded-full animate-pulse"></div>
              <div className="h-4 w-20 bg-slate-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
        {/* KPI Kartları Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="border-0 bg-gradient-to-br from-slate-50 to-slate-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-24 bg-slate-200 rounded animate-pulse"></div>
                <div className="h-8 w-8 bg-slate-200 rounded-lg animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 w-32 bg-slate-200 rounded animate-pulse mb-2"></div>
                <div className="h-3 w-40 bg-slate-200 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Varlık Kartları Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="border-0 bg-gradient-to-br from-slate-50 to-slate-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-28 bg-slate-200 rounded animate-pulse"></div>
                <div className="h-8 w-8 bg-slate-200 rounded-lg animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 w-32 bg-slate-200 rounded animate-pulse mb-2"></div>
                <div className="h-3 w-36 bg-slate-200 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* İki Sütunlu Kartlar Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {[1, 2].map(i => (
            <Card key={i} className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-t-lg">
                <div className="h-6 w-40 bg-slate-200 rounded animate-pulse mb-2"></div>
                <div className="h-4 w-48 bg-slate-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {[1, 2, 3].map(j => (
                    <div key={j} className="p-4 border border-slate-200 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="h-4 w-32 bg-slate-200 rounded animate-pulse mb-2"></div>
                          <div className="h-3 w-24 bg-slate-200 rounded animate-pulse mb-1"></div>
                          <div className="h-3 w-20 bg-slate-200 rounded animate-pulse"></div>
                        </div>
                        <div className="text-right">
                          <div className="h-5 w-24 bg-slate-200 rounded animate-pulse mb-1"></div>
                          <div className="h-3 w-20 bg-slate-200 rounded animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
