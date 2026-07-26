import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { ArrowLeft, FileText, Shield, ScrollText, Info, BookOpen, ChevronRight, Mail } from 'lucide-react'

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
    icon: FileText,
    title: 'Acceptance of Terms',
    content:
      'By accessing or using the EcoKogi platform, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you may not use our services. These terms constitute a legally binding agreement between you and the EcoKogi Waste Management Authority.',
  },
  {
    icon: ScrollText,
    title: 'User Accounts & Responsibilities',
    content:
      'You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account. You agree to provide accurate, current, and complete information during registration. Any misuse of the platform, including fraudulent reporting or abuse of the reward system, may result in account suspension or termination.',
  },
  {
    icon: Shield,
    title: 'Service Description',
    content:
      'EcoKogi provides a digital waste management platform connecting citizens, government agencies, and recycling vendors. Services include waste reporting, collection scheduling, recycling rewards, and environmental analytics. We reserve the right to modify, suspend, or discontinue any aspect of the service with reasonable notice.',
  },
  {
    icon: Info,
    title: 'Intellectual Property',
    content:
      'All content, trademarks, and intellectual property on the EcoKogi platform are owned by the Kogi State Waste Management Authority or its licensors. You may not reproduce, distribute, or create derivative works without explicit written permission. User-generated content submitted to the platform may be used for service improvement and anonymized reporting.',
  },
  {
    icon: BookOpen,
    title: 'Limitation of Liability',
    content:
      'EcoKogi and its affiliates shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the platform. We make no warranties regarding the uninterrupted availability of the service. In no event shall our liability exceed the amount paid by you for the service, if any.',
  },
  {
    icon: ScrollText,
    title: 'Termination',
    content:
      'We reserve the right to suspend or terminate access to the platform at our discretion, without prior notice, for conduct that violates these terms or is harmful to other users or the platform. Upon termination, your right to use the service ceases immediately. Provisions regarding intellectual property and liability limitations survive termination.',
  },
]

export function Terms({ onBack }: { onBack: () => void }) {
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
                <ScrollText className="w-4 h-4" />
                Terms of Service
              </motion.span>
              <motion.h1
                className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight mb-6"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.35 }}
              >
                Terms of{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-emerald-400">
                  Service
                </span>
              </motion.h1>
              <motion.p
                className="text-lg sm:text-xl text-emerald-100/80 leading-relaxed max-w-lg"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                Please read these terms carefully before using the EcoKogi platform. By using our services, you agree to be bound by these terms.
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
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Have Questions About Our Terms?</h2>
            <p className="text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
              Reach out to our legal team for any clarifications regarding the terms of service.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="mailto:legal@ecokogi.ng"
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-7 py-3.5 rounded-xl transition-all duration-300 shadow-lg shadow-emerald-600/25 hover:shadow-emerald-500/40"
              >
                <Mail className="w-4 h-4" />
                legal@ecokogi.ng
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

export default Terms