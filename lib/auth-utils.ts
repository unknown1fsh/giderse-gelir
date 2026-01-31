import { NextRequest } from 'next/server'

// Basit token kontrolü (Edge runtime için)
export function hasValidToken(request: NextRequest): boolean {
  const token = request.cookies.get('auth-token')?.value
  return !!token
}
