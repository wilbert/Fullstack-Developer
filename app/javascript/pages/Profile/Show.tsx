import { Head, Link } from '@inertiajs/react'
import AppLayout from '@/layouts/AppLayout'
import Avatar from '@/components/Avatar'
import RoleBadge from '@/components/RoleBadge'
import type { User } from '@/types'

/** Props from ProfilesController#show. */
type Props = { user: User }

const joinedAt = new Intl.DateTimeFormat(undefined, { dateStyle: 'long' })

export default function ProfileShow({ user }: Props) {
  return (
    <>
      <Head title="Your profile" />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <Avatar user={user} size="md" />
          <h1 className="text-2xl font-semibold tracking-tight wrap-anywhere">{user.full_name}</h1>
          <RoleBadge role={user.role} />
        </div>
        <Link
          href="/profile/edit"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-700"
        >
          Edit profile
        </Link>
      </div>

      <dl className="mt-6 max-w-lg divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white text-sm">
        <div className="flex justify-between gap-4 px-4 py-3">
          <dt className="text-slate-500">Email</dt>
          <dd className="min-w-0 text-right wrap-anywhere">{user.email_address}</dd>
        </div>
        <div className="flex justify-between gap-4 px-4 py-3">
          <dt className="text-slate-500">Role</dt>
          <dd className="capitalize">{user.role}</dd>
        </div>
        <div className="flex justify-between gap-4 px-4 py-3">
          <dt className="text-slate-500">Joined</dt>
          <dd>
            <time dateTime={user.created_at}>{joinedAt.format(new Date(user.created_at))}</time>
          </dd>
        </div>
      </dl>
    </>
  )
}

ProfileShow.layout = AppLayout
