import { Head, Link } from '@inertiajs/react'
import AppLayout from '@/layouts/AppLayout'
import type { DashboardStats, UserRole } from '@/types'

/** Props from Admin::DashboardsController#show. */
type Props = { stats: DashboardStats }

const ROLES: UserRole[] = ['admin', 'member']

const generatedAt = new Intl.DateTimeFormat(undefined, { timeStyle: 'medium' })

function Tile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-4 py-5">
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className="mt-1 text-3xl font-semibold tracking-tight tabular-nums">{value}</dd>
    </div>
  )
}

export default function Dashboard({ stats }: Props) {
  return (
    <>
      <Head title="Admin dashboard" />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Admin dashboard</h1>
        <Link
          href="/admin/users"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-700"
        >
          Manage users
        </Link>
      </div>

      <dl className="mt-6 grid gap-4 sm:grid-cols-3">
        <Tile label="Total users" value={stats.total} />
        {ROLES.map((role) => (
          <Tile key={role} label={`${role[0].toUpperCase()}${role.slice(1)}s`} value={stats.by_role[role]} />
        ))}
      </dl>

      <p className="mt-4 text-sm text-slate-500">
        Counted at{' '}
        <time dateTime={stats.generated_at}>{generatedAt.format(new Date(stats.generated_at))}</time>
      </p>
    </>
  )
}

Dashboard.layout = AppLayout
