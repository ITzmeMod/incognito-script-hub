import ScriptLinks from "@/components/script-links"
import Footer from "@/components/footer"
import Header from "@/components/header"
import OwnerDashboard from "@/components/owner-dashboard"
import WelcomeAnimation from "@/components/welcome-animation"

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white overflow-hidden">
      {/* Background with code/hacker aesthetic */}
      <div className="fixed inset-0 z-0 opacity-20">
        <div className="absolute inset-0 bg-[url('/matrix-bg.png')] bg-repeat"></div>
      </div>

      <div className="relative z-10">
        <Header />
        <WelcomeAnimation />
        <ScriptLinks />
        <div className="max-w-6xl mx-auto px-6">
          <OwnerDashboard />
        </div>
        <Footer />
      </div>
    </main>
  )
}
