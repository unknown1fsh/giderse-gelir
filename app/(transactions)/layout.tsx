import Sidebar from '@/components/sidebar'

export default function TransactionsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen h-[100dvh]">
      <Sidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
