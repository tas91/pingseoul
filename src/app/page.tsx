import Navbar from '@/components/Navbar'
import HeroSection from '@/components/HeroSection'
import EventTabs from '@/components/EventTabs'
import OperatingHoursSection from '@/components/OperatingHoursSection'
import IncentiveBanner from '@/components/IncentiveBanner'
import MenuSection from '@/components/MenuSection'
import InstagramFeed from '@/components/InstagramFeed'
import Footer from '@/components/Footer'
import FloatingButton from '@/components/FloatingButton'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getUpcomingEventsByWeek } from '@/lib/supabase/queries/events'

const Divider = ({ accent = false }: { accent?: boolean }) => (
  <div className={`w-full h-px bg-gradient-to-r from-transparent ${accent ? 'via-[#E63027]/20' : 'via-white/5'} to-transparent`} />
)

export default async function HomePage() {
  const supabase = createServerSupabaseClient()
  const { thisWeek, nextWeek, weekAfterNext } = await getUpcomingEventsByWeek(supabase)

  return (
    <main className="relative bg-black min-h-screen">
      <Navbar />
      <HeroSection />

      <Divider accent />
      <EventTabs thisWeek={thisWeek} nextWeek={nextWeek} weekAfterNext={weekAfterNext} />

      <Divider />
      <OperatingHoursSection />

      <Divider accent />
      <IncentiveBanner />

      <Divider />
      <MenuSection />

      <Divider accent />
      <InstagramFeed />

      <Footer />
      <FloatingButton />
    </main>
  )
}
