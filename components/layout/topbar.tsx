'use client'
import { UserRound } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getCurrentUser } from '@/features/auth/api/auth'
import { ProfileModal } from '@/features/profile/components/profile-modal'
import { checkIsAdmin, getAdminCookingTips } from '@/features/admin/actions'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function Topbar() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null)
  const [tip, setTip] = useState<string>('Loading tip...')
  const [isAdmin, setIsAdmin] = useState<boolean>(false)
  const pathname = usePathname()
  const isOnAdmin = pathname.startsWith('/admin')

  useEffect(() => {
    const fetchTip = async () => {
      try {
        const tipsData = await getAdminCookingTips()
        if (tipsData && tipsData.length > 0) {
          const randomTip =
            tipsData[Math.floor(Math.random() * tipsData.length)].tip
          setTip(randomTip)
        } else {
          setTip('Stay hydrated while cooking!')
        }
      } catch (err) {
        setTip('Stay hydrated while cooking!')
      }
    }

    fetchTip()
    getCurrentUser().then(setUser)
    checkIsAdmin().then(setIsAdmin)
  }, [])

  return (
    <div className="bg-customWhite rounded-tr-xl border-b border-border text-brand h-16 shrink-0 flex items-center justify-between px-4">
      <h1 className="text-2xl">
        <b>Cooking tip:</b> {tip}
      </h1>

      <div className="flex items-center gap-4">
        {isAdmin &&
          (isOnAdmin ? (
            <Button variant="outline" size="sm" asChild>
              <Link href="/home">Go to Main</Link>
            </Button>
          ) : (
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin">Admin Dashboard</Link>
            </Button>
          ))}

        <ProfileModal user={user}>
          <div className="flex items-center bg-white rounded-full border border-border gap-2 cursor-pointer w-max hover:bg-gray-50 transition-colors">
            <div className="border border-border  rounded-full h-9 w-9 flex items-center justify-center overflow-hidden shrink-0">
              {user?.user_metadata?.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
                  alt="Avatar"
                  className="h-full w-full object-cover"
                />
              ) : (
                <UserRound className="w-5 h-5" />
              )}
            </div>
            <div className="pr-4">
              <h4 className="text-muted-foreground text-sm font-medium">
                {user ? user.email : 'Boiling...'}
              </h4>
            </div>
          </div>
        </ProfileModal>
      </div>
    </div>
  )
}
