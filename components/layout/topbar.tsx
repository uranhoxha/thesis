/* eslint-disable @next/next/no-img-element */
'use client'
import { Lightbulb, Menu, ShoppingCart, UserRound } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getCurrentUser } from '@/features/auth/api/auth'
import { ProfileModal } from '@/features/profile/components/profile-modal'
import { checkIsAdmin, getAdminCookingTips } from '@/features/admin/actions'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { VoiceToggle } from '@/features/voice/components/voice-toggle'
import { Sidebar } from '@/components/layout/sidebar'
import { BuyList } from '@/features/buy-list/components/buy-list'
import { Timer } from '@/features/timer/components/timer'

export function Topbar() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null)
  const [tip, setTip] = useState<string>('Loading tip...')
  const [isAdmin, setIsAdmin] = useState<boolean>(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [toolsOpen, setToolsOpen] = useState(false)
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
    <div className="bg-customWhite md:rounded-tr-xl border-b border-border text-brand h-14 md:h-16 shrink-0 flex items-center justify-between gap-2 px-3 md:px-4">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden shrink-0"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="p-0 w-72 max-w-[85vw]"
            showCloseButton={false}
          >
            <SheetTitle className="sr-only">Recipes</SheetTitle>
            <SheetDescription className="sr-only">
              Your recipes and account settings.
            </SheetDescription>
            <Sidebar onNavigate={() => setMenuOpen(false)} />
          </SheetContent>
        </Sheet>

        <h1 className="text-sm md:text-2xl truncate min-w-0 flex items-center">
          <b className="hidden sm:inline">Cooking tip:</b>
          <span className="sm:hidden"><Lightbulb size={17}/> </span>
          <span className="ml-1">{tip}</span>
        </h1>
      </div>

      <div className="flex items-center gap-1 md:gap-4 shrink-0">
        <VoiceToggle />

        {isAdmin &&
          (isOnAdmin ? (
            <Button variant="outline" size="sm" asChild>
              <Link href="/home">
                <span className="hidden md:inline">Go to Main</span>
                <span className="md:hidden">Main</span>
              </Link>
            </Button>
          ) : (
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin">
                <span className="hidden md:inline">Admin Dashboard</span>
                <span className="md:hidden">Admin</span>
              </Link>
            </Button>
          ))}

        <Sheet open={toolsOpen} onOpenChange={setToolsOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden shrink-0"
              aria-label="Open shopping list and timer"
            >
              <ShoppingCart className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="p-0 w-72 max-w-[85vw]"
            showCloseButton={false}
          >
            <SheetTitle className="sr-only">Tools</SheetTitle>
            <SheetDescription className="sr-only">
              Buy list and cooking timer.
            </SheetDescription>
            <div className="flex flex-col h-full">
              <BuyList />
              <Timer />
            </div>
          </SheetContent>
        </Sheet>

        <ProfileModal user={user}>
          <div className="flex items-center bg-white rounded-full border border-border gap-2 cursor-pointer w-max hover:bg-gray-50 transition-colors">
            <div className="border border-border rounded-full h-8 w-8 md:h-9 md:w-9 flex items-center justify-center overflow-hidden shrink-0">
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
            <div className="pr-4 hidden md:block">
              <h4 className="text-muted-foreground text-sm font-medium truncate max-w-[180px]">
                {user ? user.email : 'Boiling...'}
              </h4>
            </div>
          </div>
        </ProfileModal>
      </div>
    </div>
  )
}
