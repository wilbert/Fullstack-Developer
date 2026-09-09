import { createConsumer, type Consumer } from '@rails/actioncable'
import { router } from '@inertiajs/react'
import { useEffect, useRef } from 'react'

let consumer: Consumer | null = null
const getConsumer = () => (consumer ??= createConsumer())

export function useDashboardStream() {
  const pending = useRef<number | null>(null)

  useEffect(() => {
    const refresh = () => router.reload({ only: ['stats'] })

    const subscription = getConsumer().subscriptions.create(
      { channel: 'DashboardChannel' },
      {
        // Reconnects after a network drop land here. Refetch so we
        // do not sit on counts that went stale while offline.
        connected: refresh,

        received() {
          if (pending.current) return
          pending.current = window.setTimeout(() => {
            pending.current = null
            refresh()
          }, 250)
        },
      },
    )

    return () => {
      if (pending.current) clearTimeout(pending.current)
      subscription.unsubscribe()
    }
  }, [])
}
