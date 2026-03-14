import { redirect } from 'next/navigation'

interface AccountsNewPageProps {
  searchParams?: Promise<{
    type?: string
  }>
}

export default async function AccountsNewPage({ searchParams }: AccountsNewPageProps) {
  const resolvedSearchParams = await searchParams
  const type = resolvedSearchParams?.type

  if (type && ['bank', 'credit_card', 'gold'].includes(type)) {
    redirect(`/accounts?openNew=1&type=${type}`)
  }

  redirect('/accounts?openNew=1')
}
