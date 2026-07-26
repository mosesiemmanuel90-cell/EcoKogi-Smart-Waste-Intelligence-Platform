import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { ArrowLeft, Shield, Lock, Eye, Cookie, FileText, TriangleAlert } from 'lucide-react'

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

const sections = [
  {
    icon: Shield,
    title: 'Information We Collect',
    content:
      'When you register for an EcoKogi account, we collect your name, email address, phone number, and physical address. We also collect location data when you report illegal dumping or schedule waste collection. Usage data, including pages visited and features accessed, is collected to improve our service.',
  },
  {
    icon: Lock,
    title: 'How We Use Your Information',
    content:
      'Your information is used to process waste collection requests, manage your recycling rewards account, send service notifications, and improve our platform. We may also use anonymized data for environmental reporting and public health analytics in partnership with Kogi State Government.',
  },
  {
    icon: Eye,
    title: 'Data Sharing & Disclosure',
    content:
      'EcoKogi does not sell your personal data. We may share necessary information with authorized waste collection vendors and government agencies for service delivery purposes. All third-party partners are bound by strict data protection agreements.',
  },
  {
    icon: Cookie,
    title: 'Cookies & Tracking',
    content:
      'We use essential cookies to maintain your session and optional analytics cookies to understand usage patterns. You can control cookie preferences through your browser settings. Disabling certain cookies may affect platform functionality.',
  },
  {
    icon: TriangleAlert,
    title: 'Data Security',
    content:
      'We implement industry-standard encryption, secure servers, and access controls to protect your data. Regular security audits are conducted to ensure compliance with Nigerian data protection regulations (NDPR). In the event of a data breach, affected users will be notified within 72 hours.',
  },
  {
    icon: FileText,
    title: 'Your Rights',
    content:
      'You have the right to access, correct, or delete your personal data at any time through your account settings. You may also request a copy of your data or withdraw consent for data processing by contacting our Data Protection Officer at privacy@ecokogi.ng.',
  },
]

export function Privacy({ onBack }: { onBack: () => void }) {
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
                <Shield className="w-4 h-4" />
                Privacy Policy
              </motion.span>
              <motion.h1
                className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight mb-6"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.35 }}
              >
                Your{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-emerald-400">
                  Privacy
                </span>{' '}
                Matters
              </motion.h1>
              <motion.p
                className="text-lg sm:text-xl text-emerald-100/80 leading-relaxed max-w-lg"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                We are committed to protecting your personal data and being transparent about how we collect, use, and share your information.
              </motion.p>
              <motion.p
                className="text-sm text-emerald-300/60 mt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.7 }}
              >
                Last updated: March 2025
              </motion.p>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent z-10" />
      </section>

      {/* SECTIONS */}
      <section className="py-24 lg:py-32">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="space-y-12">
            {sections.map((section, i) => (
              <FadeInSection key={section.title}>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="flex gap-6"
                >
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0 mt-1">
                    <section.icon className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 mb-3">{section.title}</h2>
                    <p className="text-slate-600 leading-relaxed">{section.content}</p>
                  </div>
                </motion.div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section className="py-24 lg:py-32 bg-slate-50">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <FadeInSection>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Have Questions About Your Data?</h2>
            <p className="text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
              Contact our Data Protection Officer for any privacy-related inquiries.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="mailto:privacy@ecokogi.ng"
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-7 py-3.5 rounded-xl transition-all duration-300 shadow-lg shadow-emerald-600/25 hover:shadow-emerald-500/40"
              >
                <Lock className="w-4 h-4" />
                privacy@ecokogi.ng
              </a>
              <button
                onClick={onBack}
                className="inline-flex items-center gap-2 border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold px-7 py-3.5 rounded-xl transition-all duration-300"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </button>
            </div>
          </FadeInSection>
        </div>
      </section>
    </div>
  )
}

export default Privacy