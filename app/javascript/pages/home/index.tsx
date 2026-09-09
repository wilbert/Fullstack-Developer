import { Head } from '@inertiajs/react'
import AppLayout from '@/layouts/AppLayout'

export default function Home() {
  return (
    <>
      <Head title="Home" />
      <h1 className="text-2xl font-semibold tracking-tight">Home</h1>
    </>
  )
}

Home.layout = AppLayout
