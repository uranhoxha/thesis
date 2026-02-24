import { AdminSidebar } from '@/features/admin/components/admin-sidebar'
import { Topbar } from '@/components/layout/topbar'
import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin opacity-50" />
        </div>
      }
    >
      <div className="flex h-[calc(100vh-1rem)] m-2 border border-border rounded-xl">
        <AdminSidebar />

        <div className="flex flex-col flex-1 rounded-xl">
          <Topbar />

          <div className="flex flex-1 overflow-auto">{children}</div>
        </div>
      </div>
    </Suspense>
  )
}
