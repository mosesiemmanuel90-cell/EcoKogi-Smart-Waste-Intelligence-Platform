import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import {
  ArrowLeft,
  ChevronDown,
  Mail,
  MapPin,
  PhoneCall,
  SendHorizontal,
  MessageSquare,
  Clock,
  Check,
} from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.21, 0.47, 0.32, 0.98] },
  }),
}

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

interface ContactInfo {
  icon: React.ElementType
  label: string
  value: string
  href: string
}

const contactMethods: ContactInfo[] = [
  { icon: Mail, label: 'Email', value: 'info@ecokogi.ng', href: 'mailto:info@ecokogi.ng' },
  { icon: PhoneCall, label: 'Phone', value: '+234 800 ECOKOGI', href: 'tel:+2348003265644' },
  { icon: MapPin, label: 'Office', value: 'Lokoja, Kogi State, Nigeria', href: '#' },
  { icon: Clock, label: 'Hours', value: 'Mon-Fri, 8:00 AM - 5:00 PM', href: '#' },
]

const faqItems = [
  { q: 'How do I report illegal dumping?', a: 'Use the EcoKogi Citizen App to report illegal dumping sites. Snap a photo, tag the location, and submit. Our team will dispatch a collection crew.' },
  { q: 'Can I earn rewards for recycling?', a: 'Yes. EcoKogi rewards households and businesses with points for every recyclable material properly sorted and collected. Points can be redeemed for cash or vouchers.' },
  { q: 'Who can use the EcoKogi platform?', a: 'EcoKogi serves citizens, government agencies, waste vendors, and recycling partners across Kogi State. Each role has a tailored portal.' },
  { q: 'Is the platform free for citizens?', a: 'Absolutely. The Citizen App is free to download and use. Government agencies and vendors may have tiered service plans.' },
]

export function Contact({ onBack }: { onBack: () => void }) {
  return (
    <div className="bg-white overflow-hidden">
      {/* HERO */}
      <section className="relative min-h-[70vh] flex items-center overflow-hidden">
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
                <MessageSquare className="w-4 h-4" />
                Get in Touch
              </motion.span>
              <motion.h1
                className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight mb-6"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.35 }}
              >
                Contact{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-emerald-400">
                  EcoKogi
                </span>
              </motion.h1>
              <motion.p
                className="text-lg sm:text-xl text-emerald-100/80 leading-relaxed max-w-lg"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                Have a question, suggestion, or want to partner with us? Reach out and our team will get back to you.
              </motion.p>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent z-10" />
      </section>

      {/* CONTACT INFO + FORM */}
      <section className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-12 lg:gap-20">
            {/* Left - Contact Methods */}
            <div className="lg:col-span-2 space-y-8">
              <FadeInSection>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Contact Information</h2>
                <p className="text-slate-600 leading-relaxed">
                  Choose the method that works best for you. We aim to respond within 24 hours.
                </p>
              </FadeInSection>

              <div className="space-y-4">
                {contactMethods.map((item, i) => (
                  <motion.a
                    key={item.label}
                    href={item.href}
                    custom={i}
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-60px' }}
                    className="flex items-start gap-4 group p-4 rounded-xl hover:bg-emerald-50 transition-all duration-300"
                  >
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0 group-hover:bg-emerald-100 transition-colors">
                      <item.icon className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                      <p className="text-slate-600 text-sm">{item.value}</p>
                    </div>
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Right - Contact Form */}
            <div className="lg:col-span-3">
              <FadeInSection>
                <div className="bg-white border border-slate-100 rounded-2xl p-8 lg:p-10 shadow-sm hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-500">
                  <h3 className="text-xl font-bold text-slate-900 mb-6">Send us a Message</h3>
                  <form className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                        <input
                          id="name"
                          type="text"
                          placeholder="Your name"
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-400 transition-all text-sm"
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
                        <input
                          id="email"
                          type="email"
                          placeholder="you@example.com"
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-400 transition-all text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-slate-700 mb-1.5">Subject</label>
                      <input
                        id="subject"
                        type="text"
                        placeholder="How can we help?"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-400 transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-1.5">Message</label>
                      <textarea
                        id="message"
                        rows={5}
                        placeholder="Tell us more about your inquiry..."
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-400 transition-all text-sm resize-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-7 py-3.5 rounded-xl transition-all duration-300 shadow-lg shadow-emerald-600/25 hover:shadow-emerald-500/40"
                    >
                      <SendHorizontal className="w-4 h-4" />
                      Send Message
                    </button>
                  </form>
                </div>
              </FadeInSection>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-24 lg:py-32 bg-slate-50">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <FadeInSection>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="inline-block text-sm font-semibold tracking-widest uppercase text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-full mb-4">
                Quick Answers
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 leading-tight">
                Frequently Asked Questions
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                Find answers to common questions about the EcoKogi platform.
              </p>
            </div>
          </FadeInSection>

          <div className="space-y-4">
            {faqItems.map((item, i) => (
              <motion.div
                key={i}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-60px' }}
                className="bg-white border border-slate-100 rounded-2xl p-6 hover:shadow-md hover:border-emerald-200 transition-all duration-300"
              >
                <details className="group">
                  <summary className="flex items-center justify-between cursor-pointer list-none">
                    <span className="text-base font-semibold text-slate-900 pr-4">{item.q}</span>
                    <ChevronDown className="w-5 h-5 text-emerald-600 shrink-0 transition-transform duration-300 group-open:rotate-180" />
                  </summary>
                  <p className="mt-4 text-slate-600 leading-relaxed text-sm">{item.a}</p>
                </details>
              </motion.div>
            ))}
          </div>
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
                <MessageSquare className="w-4 h-4" />
                We Are Here to Help
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-6">
                Ready to Start the Conversation?
              </h2>
              <p className="text-lg text-emerald-100/70 max-w-2xl mx-auto mb-10 leading-relaxed">
                Whether you need technical support, partnership information, or just want to share feedback, we are all ears.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <a
                  href="mailto:info@ecokogi.ng"
                  className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-400/40"
                >
                  <Mail className="w-5 h-5" />
                  Email Us Directly
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

export default Contact