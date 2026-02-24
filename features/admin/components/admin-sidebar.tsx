'use client'

import Image from 'next/image'
import GreenLogo from '@/public/green_logo.svg'
import { Button } from '@/components/ui/button'
import { LogOut, Users, BotMessageSquare, Lightbulb, Settings } from 'lucide-react'
import { logout } from '@/features/auth/api/auth'
import { useRouter, usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { SettingsModal } from '@/features/settings/components/settings-modal'

export function AdminSidebar() {
  const router = useRouter()
  const pathname = usePathname()

  const handleSelect = (path: string) => {
    router.push(path)
  }

  const navItems = [
    {
      title: 'Users',
      path: '/admin/users',
      icon: Users,
    },
    {
      title: 'Daily Picks',
      path: '/admin/chatbot',
      icon: BotMessageSquare,
    },
    {
      title: 'Cooking Tips',
      path: '/admin/cooking-tips',
      icon: Lightbulb,
    },
  ]

  return (
    <div className="bg-customWhite rounded-l-xl border-r border-border text-brand w-64 flex flex-col py-4 gap-4 h-full">
      <div className="px-2 flex flex-col items-center gap-4">
        <Image src={GreenLogo} alt="Logo" className="w-40" />
      </div>
      <div className="flex-1 flex flex-col justify-center min-h-0 gap-4 py-2">
        <div className="overflow-y-auto px-2 space-y-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.path ||
              (pathname === '/admin' && item.path === '/admin/users')
            return (
              <button
                key={item.path}
                onClick={() => handleSelect(item.path)}
                className={cn(
                  'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 shrink-0',
                  isActive
                    ? 'bg-green-100/50 text-brand font-medium'
                    : 'hover:bg-gray-100 text-gray-600',
                )}
              >
                <item.icon className="w-4 h-4 opacity-75 shrink-0" />
                <span className="truncate">{item.title}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="px-4 mt-auto shrink-0 space-y-2">
        <SettingsModal>
          <Button
            variant="ghost"
            className="w-full justify-start hover:bg-brand/10"
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </SettingsModal>
        <Button
          variant="ghost"
          onClick={() => logout()}
          className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}
