import { useForm } from '@inertiajs/react'
import { FormEvent } from 'react'
import Field from '@/components/Field'
import type { User, UserRole } from '@/types'

type Props = {
  user?: User
  roles?: UserRole[]
  action: string
  method: 'post' | 'patch'
  submitLabel: string
}

export default function UserForm({ user, roles, action, method, submitLabel }: Props) {
  const form = useForm({
    full_name: user?.full_name ?? '',
    email_address: user?.email_address ?? '',
    password: '',
    password_confirmation: '',
    avatar_url: user?.avatar_url ?? '',
    avatar_image: null as File | null,
    role: user?.role ?? ('member' as UserRole),
  })
  const { data, setData, errors, processing, progress } = form

  const submit = (event: FormEvent) => {
    event.preventDefault()

    // Inertia cannot send multipart over PATCH. Spoof the verb and force FormData.
    form.transform((current) => (method === 'patch' ? { ...current, _method: 'patch' } : current))
    form.post(action, { forceFormData: true, preserveScroll: true })
  }

  return (
    <form onSubmit={submit} className="max-w-lg space-y-4" noValidate>
      <Field label="Full name" error={errors.full_name}>
        <input
          value={data.full_name}
          onChange={(e) => setData('full_name', e.target.value)}
          required
          minLength={2}
          maxLength={120}
          className="input"
        />
      </Field>

      <Field label="Email" error={errors.email_address}>
        <input
          type="email"
          value={data.email_address}
          onChange={(e) => setData('email_address', e.target.value)}
          required
          className="input"
        />
      </Field>

      <Field label="Password" error={errors.password} hint={user ? 'Leave blank to keep current' : undefined}>
        <input
          type="password"
          value={data.password}
          onChange={(e) => setData('password', e.target.value)}
          autoComplete="new-password"
          className="input"
        />
      </Field>

      <Field label="Confirm password" error={errors.password_confirmation}>
        <input
          type="password"
          value={data.password_confirmation}
          onChange={(e) => setData('password_confirmation', e.target.value)}
          autoComplete="new-password"
          className="input"
        />
      </Field>

      <Field label="Avatar upload" error={errors.avatar_image}>
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={(e) => setData('avatar_image', e.target.files?.[0] ?? null)}
          className="text-sm"
        />
      </Field>

      <Field label="Avatar URL" error={errors.avatar_url} hint="Used when no file is uploaded">
        <input
          type="url"
          value={data.avatar_url}
          onChange={(e) => setData('avatar_url', e.target.value)}
          className="input"
        />
      </Field>

      {roles && (
        <Field label="Role" error={errors.role}>
          <select
            value={data.role}
            onChange={(e) => setData('role', e.target.value as UserRole)}
            className="input"
          >
            {roles.map((role) => <option key={role} value={role}>{role}</option>)}
          </select>
        </Field>
      )}

      {progress && (
        <progress value={progress.percentage ?? 0} max={100} className="w-full">
          {progress.percentage}%
        </progress>
      )}

      <button
        type="submit"
        disabled={processing}
        className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-700 disabled:opacity-50"
      >
        {processing ? 'Saving...' : submitLabel}
      </button>
    </form>
  )
}
