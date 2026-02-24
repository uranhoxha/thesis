import { ChatbotAdmin } from '@/features/admin/components/chatbot-admin'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getAdminDailyPicks } from '@/features/admin/actions'

export default async function AdminChatbotPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const adminEmails = process.env.ADMIN_EMAILS?.split(',') || []

  if (!user.email || !adminEmails.includes(user.email)) {
    redirect('/home')
  }

  const dailyPicks = await getAdminDailyPicks()

  return <ChatbotAdmin initialPicks={dailyPicks} />
}
