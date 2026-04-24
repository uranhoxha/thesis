import { MarketingThemeProvider } from './_components/theme-context'
import { Nav } from './_components/nav'
import { Hero } from './_components/hero'
import { Marquee } from './_components/marquee'
import { Manifesto } from './_components/manifesto'
import { Features } from './_components/features'
import { Vision } from './_components/vision'
import { Footer } from './_components/footer'

export default function MarketingPage() {
  return (
    <MarketingThemeProvider>
      <Nav />
      <main>
        <Hero />
        <Marquee />
        <Manifesto />
        <Features />
        <Vision />
      </main>
      <Footer />
    </MarketingThemeProvider>
  )
}
