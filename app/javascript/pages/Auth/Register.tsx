import { Head, Link, useForm } from '@inertiajs/react'
import { FormEvent } from 'react'
import AppLayout from '@/layouts/AppLayout'
import Field from '@/components/Field'

export default function Register() {
  const form = useForm({
    full_name: '',
    email_address: '',
    password: '',
    password_confirmation: '',
  })
  const { data, setData, errors, processing } = form

  const submit = (event: FormEvent) => {
    event.preventDefault()

    form.transform((fields) => ({ user: fields }))
    form.post('/registration', { onError: () => form.reset('password', 'password_confirmation') })
  }

  return (
    <>
      <Head title="Create account" />

      <div className="mx-auto max-w-lg">
        <h1 className="text-2xl font-semibold tracking-tight">Create your account</h1>
        <p className="mt-2 text-sm text-slate-600">
          Already registered?{' '}
          {/* The sign-in page is a plain Rails view, not an Inertia page, so it needs a full page load. */}
          <a href="/session/new" className="text-slate-900 underline hover:no-underline">Sign in</a>
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
          <Field label="Full name" error={errors.full_name}>
            <input
              value={data.full_name}
              onChange={(e) => setData('full_name', e.target.value)}
              required
              minLength={2}
              maxLength={120}
              autoComplete="name"
              autoFocus
              className="input"
            />
          </Field>

          <Field label="Email" error={errors.email_address}>
            <input
              type="email"
              value={data.email_address}
              onChange={(e) => setData('email_address', e.target.value)}
              required
              autoComplete="email"
              className="input"
            />
          </Field>

          <Field label="Password" error={errors.password} hint="At least 8 characters">
            <input
              type="password"
              value={data.password}
              onChange={(e) => setData('password', e.target.value)}
              required
              minLength={8}
              maxLength={72}
              autoComplete="new-password"
              className="input"
            />
          </Field>

          <Field label="Confirm password" error={errors.password_confirmation}>
            <input
              type="password"
              value={data.password_confirmation}
              onChange={(e) => setData('password_confirmation', e.target.value)}
              required
              autoComplete="new-password"
              className="input"
            />
          </Field>

          <button
            type="submit"
            disabled={processing}
            className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-700 disabled:opacity-50 sm:w-auto"
          >
            {processing ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-sm text-slate-500">
          <Link href="/" className="hover:underline">Back to home</Link>
        </p>
      </div>
    </>
  )
}

Register.layout = AppLayout
