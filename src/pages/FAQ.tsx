import { useState, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { ArrowLeft, CircleHelp, ChevronDown, Search, Mail, MessageCircle, ChevronRight } from 'lucide-react'

function FadeInSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={{
        hidden: { opacity: 0, y: 60 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

const categories = [
  {
    name: 'Getting Started',
    items: [
      { q: 'What is EcoKogi?', a: 'EcoKogi is a digital waste management platform connecting citizens, government agencies, and recycling vendors across Kogi State, Nigeria. It enables waste reporting, collection scheduling, recycling rewards, and environmental analytics.' },
      { q: 'How do I create an account?', a: 'Download the EcoKogi Citizen App from the Google Play Store or Apple App Store, or sign up directly on the web portal. Provide your name, email, phone number, and address to get started.' },
      { q: 'Is EcoKogi free to use?', a: 'Yes, the Citizen App is completely free. Government agencies and waste vendors may have tiered service plans with additional features.' },
      { q: 'Which areas does EcoKogi cover?', a: 'EcoKogi currently operates across Kogi State, starting with major urban centers including Lokoja, Okene, Kabba, Idah, and Ankpa. We are expanding to all 21 Local Government Areas.' },
    ],
  },
  {
    name: 'Waste Reporting & Collection',
    items: [
      { q: 'How do I report illegal dumping?', a: 'Open the EcoKogi app, tap "Report Dumping," snap a photo of the site, and tag the location on the map. Our team will dispatch a collection crew and notify the relevant LGA authority.' },
      { q: 'How do I schedule a waste collection?', a: 'Navigate to the "Schedule Pickup" section in the app, select your waste type (household, recyclable, or bulk), choose a preferred date and time, and confirm. You will receive a notification when the crew is en route.' },
      { q: 'What types of waste do you collect?', a: 'We collect household waste, recyclable materials (plastics, metals, glass, paper), electronic waste, and bulk waste. Hazardous materials require special handling — please contact us directly for disposal guidance.' },
      { q: 'How often is waste collected?', a: 'Regular collection schedules vary by LGA. Generally, household waste is collected weekly, recyclables bi-weekly, and bulk waste on-demand. Check the app for your specific collection day.' },
    ],
  },
  {
    name: 'Rewards & Recycling',
    items: [
      { q: 'How do I earn recycling rewards?', a: 'Sort your recyclables (plastics, metals, glass, paper) and place them in designated EcoKogi bins. Each properly sorted collection earns you points that can be redeemed for cash or vouchers.' },
      { q: 'How do I redeem my points?', a: 'Accumulated points can be redeemed through the app via bank transfer, mobile money, or partner vouchers. A minimum of 500 points is required for redemption.' },
      { q: 'What materials are accepted for recycling?', a: 'We accept clean plastics (PET, HDPE, PP), metals (aluminum, steel), glass (clear, green, brown), paper and cardboard, and select electronics. Check the app for a detailed acceptance guide.' },
      { q: 'Can businesses participate in the recycling program?', a: 'Absolutely. Businesses can register as commercial recycling partners. Volume-based incentives and bulk collection services are available. Contact our partnership team for more details.' },
    ],
  },
  {
    name: 'Technical Support',
    items: [
      { q: 'The app is not loading / crashing. What should I do?', a: 'First, ensure you have the latest version installed. Try clearing the app cache or restarting your device. If the issue persists, contact our support team at support@ecokogi.ng with your device model and OS version.' },
      { q: 'How do I update my account information?', a: 'Go to "Profile" in the app settings. You can update your name, phone number, and address. Email changes require verification — contact support if you need to update your email address.' },
      { q: 'I forgot my password. How do I reset it?', a: 'Tap "Forgot Password" on the login screen. Enter your registered email address, and we will send a password reset link. If you do not receive the email within 5 minutes, check your spam folder.' },
      { q: 'Is my data secure on the platform?', a: 'Yes. EcoKogi uses industry-standard encryption, secure servers, and strict access controls. We comply with the Nigeria Data Protection Regulation (NDPR). See our Privacy Policy for full details.' },
    ],
  },
]

export function FAQ({ onBack }: { onBack: () => void }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState(categories[0].name)

  const filteredCategories = categories.map((cat) => ({
    ...cat,
    items: cat.items.filter(
      (item) =>
        item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.a.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  }))

  const hasResults = filteredCategories.some((cat) => cat.items.length > 0)

  return (
    <div className="bg-white overflow-hidden">
      {/* HERO */}
      <section className="relative min-h-[60vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-900" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(16,185,129,0.15)_0%,_transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(5,150,105,0.1)_0%,_transparent_50%)]" />
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />
        </div>

        <motion.div
          className="absolute top-6 left-6 z-20"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-emerald-300 hover:text-emerald-200 bg-emerald-900/40 backdrop-blur-sm px-4 py-2 rounded-xl text-sm font-medium border border-emerald-700/30 hover:bg-emerald-800/50 transition-all duration-300"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>
        </motion.div>

        <div className="relative z-10 w-full">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-24 lg:py-32">
            <div className="max-w-3xl">
              <motion.span
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="inline-flex items-center gap-2 text-emerald-300 bg-emerald-900/50 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium border border-emerald-700/50 mb-4"
              >
                <CircleHelp className="w-4 h-4" />
                FAQ
              </motion.span>
              <motion.h1
                className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight mb-6"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.35 }}
              >
                Frequently Asked{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-emerald-400">
                  Questions
                </span>
              </motion.h1>
              <motion.p
                className="text-lg sm:text-xl text-emerald-100/80 leading-relaxed max-w-lg"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                Everything you need to know about the EcoKogi platform. Can't find what you are looking for? Reach out to our support team.
              </motion.p>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent z-10" />
      </section>

      {/* SEARCH + CATEGORIES */}
      <section className="py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          {/* Search */}
          <FadeInSection>
            <div className="relative max-w-xl mx-auto mb-12">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-400 transition-all text-base shadow-sm"
              />
            </div>
          </FadeInSection>

          {/* Category Tabs */}
          <FadeInSection>
            <div className="flex flex-wrap justify-center gap-2 mb-12">
              {categories.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => setActiveCategory(cat.name)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                    activeCategory === cat.name
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </FadeInSection>

          {/* FAQ Items */}
          {!hasResults && (
            <FadeInSection>
              <div className="text-center py-16">
                <CircleHelp className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 text-lg">No questions found matching your search.</p>
                <p className="text-slate-400 text-sm mt-2">Try a different search term or browse by category.</p>
              </div>
            </FadeInSection>
          )}

          {filteredCategories.map((cat) => (
            cat.items.length > 0 && (
              <div key={cat.name} className={`mb-8 ${cat.name !== activeCategory ? 'hidden' : ''}`}>
                <div className="space-y-3">
                  {cat.items.map((item, i) => (
                    <FadeInSection key={i}>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: i * 0.05 }}
                        className="bg-white border border-slate-100 rounded-2xl hover:shadow-md hover:border-emerald-200 transition-all duration-300"
                      >
                        <details className="group p-6">
                          <summary className="flex items-center justify-between cursor-pointer list-none">
                            <span className="text-base font-semibold text-slate-900 pr-4">{item.q}</span>
                            <ChevronDown className="w-5 h-5 text-emerald-600 shrink-0 transition-transform duration-300 group-open:rotate-180" />
                          </summary>
                          <p className="mt-4 text-slate-600 leading-relaxed text-sm">{item.a}</p>
                        </details>
                      </motion.div>
                    </FadeInSection>
                  ))}
                </div>
              </div>
            )
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-900" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(16,185,129,0.12)_0%,_transparent_60%)]" />
        <div className="relative z-10 max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <FadeInSection>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 text-emerald-300 bg-emerald-900/50 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium border border-emerald-700/50 mb-6">
                <MessageCircle className="w-4 h-4" />
                Still Have Questions?
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-6">
                We Are Here to Help
              </h2>
              <p className="text-lg text-emerald-100/70 max-w-2xl mx-auto mb-10 leading-relaxed">
                Our support team typically responds within 24 hours. For urgent inquiries, please call us directly.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <a
                  href="mailto:support@ecokogi.ng"
                  className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-400/40"
                >
                  <Mail className="w-5 h-5" />
                  Email Support
                </a>
                <button
                  onClick={onBack}
                  className="inline-flex items-center gap-2 border border-emerald-700/50 text-emerald-200 hover:bg-emerald-800/50 font-semibold px-8 py-4 rounded-xl transition-all duration-300 backdrop-blur-sm"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back to Home
                </button>
              </div>
            </motion.div>
          </FadeInSection>
        </div>
      </section>
    </div>
  )
}

export default FAQ