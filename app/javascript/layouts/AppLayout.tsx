import { Link, usePage } from '@inertiajs/react'
import { PropsWithChildren, useEffect, useState } from 'react'
import type { SharedProps } from '@/types'

export default function AppLayout({ children }: PropsWithChildren) {
  const { auth, flash } = usePage<SharedProps>().props
  const [banner, setBanner] = useState(flash.notice || flash.alert)

  useEffect(() => setBanner(flash.notice || flash.alert), [flash])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/" className="font-semibold tracking-tight">Umanni</Link>
          <div className="flex items-center gap-4 text-sm">
            {auth.user?.admin && (
              <>
                <Link href="/admin" className="hover:underline">Dashboard</Link>
                <Link href="/admin/users" className="hover:underline">Users</Link>
              </>
            )}
            {auth.user ? (
              <>
                <Link href="/profile" className="hover:underline">{auth.user.full_name}</Link>
                <Link href="/session" method="delete" as="button" className="text-slate-500 hover:underline">
                  Sign out
                </Link>
              </>
            ) : (
              <Link href="/session/new" className="hover:underline">Sign in</Link>
            )}
          </div>
        </nav>
      </header>

      {banner && (
        <div
          role="status"
          className={`mx-auto mt-4 max-w-6xl rounded-md px-4 py-3 text-sm ${
            flash.alert ? 'bg-red-50 text-red-800' : 'bg-emerald-50 text-emerald-800'
          }`}
        >
          {banner}
        </div>
      )}

      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  )
}
