import { redirect } from 'next/navigation'

interface AccountsNewPageProps {
  searchParams?: {
    type?: string
  }
}

export default function AccountsNewPage({ searchParams }: AccountsNewPageProps) {
  const type = searchParams?.type

  if (type && ['bank', 'credit_card', 'gold'].includes(type)) {
    redirect(`/accounts?openNew=1&type=${type}`)
  }

  redirect('/accounts?openNew=1')
}
