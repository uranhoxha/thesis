import { ChatbotAdmin } from '@/features/admin/components/chatbot-admin'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getAdminCookingTips } from '@/features/admin/actions'
import { CookingTipsAdmin } from '@/features/admin/components/cooking-tips-admin'

export default async function AdminCookingTipsPage() {
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

  const cookingTips = await getAdminCookingTips()

  return <CookingTipsAdmin initialTips={cookingTips} />
}
