import { BuyList } from '@/features/buy-list/components/buy-list'
import { Main } from '@/features/home/components/main-view'
import { Sidebar } from '@/components/layout/sidebar'
import { Timer } from '@/features/timer/components/timer'
import { Topbar } from '@/components/layout/topbar'
import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin opacity-50" />
        </div>
      }
    >
      <div className="flex h-[100dvh] md:h-[calc(100vh-1rem)] md:m-2 md:border md:border-border md:rounded-xl overflow-hidden">
        <div className="hidden md:flex shrink-0">
          <Sidebar />
        </div>

        <div className="flex flex-col flex-1 min-w-0 rounded-xl">
          <Topbar />

          <div className="flex flex-1 min-h-0">
            <Main />

            <div className="hidden md:flex flex-col w-64 border-l border-border shrink-0">
              <BuyList />
              <Timer />
            </div>
          </div>
        </div>
      </div>
    </Suspense>
  )
}
