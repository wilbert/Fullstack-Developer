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

export type SortKey = 'full_name' | 'role' | 'created_at'
export type SortDirection = 'asc' | 'desc'

/** Mirrors UserSearch#to_props. */
export type Filters = {
  query: string
  sort: SortKey
  direction: SortDirection
  role: UserRole | null
  page: number
  total_pages: number
  total: number
}

/** The subset of Filters that UserSearch actually reads back off the query string. */
export type SearchParams = Pick<Filters, 'query' | 'sort' | 'direction' | 'role' | 'page'>
