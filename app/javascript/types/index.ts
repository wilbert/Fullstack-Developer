export type FlashData = {
  notice: string | null
  alert: string | null
}

export type UserRole = 'member' | 'admin'

/** Mirrors the payload of UserSerializer#as_json. */
export type User = {
  id: number
  full_name: string
  email_address: string
  role: UserRole
  admin: boolean
  avatar_url: string | null
  created_at: string
}

/** Shared with every Inertia response by ApplicationController#inertia_share. */
export type SharedProps = {
  auth: { user: User | null }
  flash: FlashData
}
