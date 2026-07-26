import { useEffect, useRef } from 'react'
import { motion, useInView, useScroll, useTransform } from 'framer-motion'
import {
  ArrowLeft,
  Leaf,
  Target,
  Eye,
  Recycle,
  Users,
  Heart,
  Shield,
  Globe,
  Cpu,
  Sprout,
  Check,
  ArrowRight,
  Sun,
  TrendingUp,
  Building2,
  Sparkles,
} from 'lucide-react'

/* ── Types ── */
interface SectionCard {
  icon: React.ElementType
  title: string
  description: string
}

interface Objective {
  text: string
}

/* ── Data ── */

const objectives: Objective[] = [
  { text: 'Develop a digital platform connecting citizens, government agencies, and waste management vendors for efficient reporting and collection.' },
  { text: 'Promote environmental sustainability by leveraging AI-powered analytics for waste sorting, route optimization, and recycling insights.' },
  { text: 'Empower local communities with tools to participate in waste-to-wealth initiatives and earn rewards for recycling efforts.' },
  { text: 'Support Kogi State Government in achieving SDGs 3, 6, 11, 12, 13, and 15 through data-driven environmental management.' },
  { text: 'Create a scalable, open platform that can be adopted by other states and regions seeking digital waste management solutions.' },
]

const wasteToWealthPoints: SectionCard[] = [
  { icon: Recycle, title: 'Material Recovery', description: 'Proper sorting and collection of recyclable materials — plastics, metals, glass, and organics — that can be processed and re-introduced into the economy.' },
  { icon: Sprout, title: 'Circular Economy', description: 'Moving away from the linear take-make-dispose model toward a closed-loop system where waste becomes a resource for new products and energy.' },
  { icon: TrendingUp, title: 'Economic Empowerment', description: 'Creating green jobs, vendor opportunities, and incentive programs that reward households and businesses for active participation in recycling.' },
]

const govCollabPoints: SectionCard[] = [
  { icon: Building2, title: 'Kogi State Government', description: 'Partnering with the Ministry of Environment and the Kogi State Waste Management Authority to deploy digital tools across the state.' },
  { icon: Shield, title: 'Regulatory Compliance', description: 'Aligning with national environmental regulations and the National Environmental Standards and Regulations Enforcement Agency (NESREA) guidelines.' },
  { icon: Users, title: 'Public Service Delivery', description: 'Empowering local government area (LGA) officials with dashboards and real-time data to monitor waste collection, fleet operations, and environmental compliance.' },
]

const citizenPoints: SectionCard[] = [
  { icon: Heart, title: 'Community Engagement', description: 'Educating and incentivizing residents to adopt sustainable waste practices through the EcoKogi mobile platform.' },
  { icon: Users, title: 'Participatory Reporting', description: 'Enabling citizens to report illegal dumping, request pickups, and track their personal environmental impact through a user-friendly interface.' },
  { icon: Globe, title: 'Awareness & Education', description: 'Raising environmental consciousness across Kogi State through school programs, public campaigns, and digital literacy initiatives.' },
]

const sdgItems = [
  { code: 'SDG 3', label: 'Good Health and Well-being' },
  { code: 'SDG 6', label: 'Clean Water and Sanitation' },
  { code: 'SDG 11', label: 'Sustainable Cities and Communities' },
  { code: 'SDG 12', label: 'Responsible Consumption and Production' },
  { code: 'SDG 13', label: 'Climate Action' },
  { code: 'SDG 15', label: 'Life on Land' },
]

const techStackItems = [
  'React + TypeScript frontend with responsive mobile-first design',
  'Supabase backend for real-time data, authentication, and file storage',
  'PostgreSQL database with geospatial (GIS) querying for waste hotspots',
  'AI-assisted analytics for waste classification and route optimization',
  'Power BI integration for government dashboards and reporting',
  'Open API architecture for third-party and inter-agency integration',
]

/* ── Reusable Components ── */
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.21, 0.47, 0.32, 0.98] },
  }),
}

function SectionHeading({ label, title, description }: { label: string; title: string; description: string }) {
  return (
    <div className="text-center max-w-3xl mx-auto mb-16">
      <span className="inline-block text-sm font-semibold tracking-widest uppercase text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-full mb-4">
        {label}
      </span>
      <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 leading-tight">{title}</h2>
      <p className="text-lg text-slate-600 leading-relaxed">{description}</p>
    </div>
  )
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

function CardGrid({ items }: { items: SectionCard[] }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item, i) => (
        <motion.div
          key={item.title}
          custom={i}
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="group relative bg-white border border-slate-100 rounded-2xl p-7 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-500 hover:border-emerald-200"
        >
          <div className="w-12 h-12 rounded-lg bg-emerald-50 flex items-center justify-center mb-4 group-hover:bg-emerald-100 transition-colors">
            <item.icon className="w-6 h-6 text-emerald-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
          <p className="text-slate-600 text-sm leading-relaxed">{item.description}</p>
        </motion.div>
      ))}
    </div>
  )
}

/* ── Main Page ── */
export function About({ onBack }: { onBack: () => void }) {
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroBgY = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  return (
    <div className="bg-white overflow-hidden">
      {/* ─── HERO ─── */}
      <section ref={heroRef} className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background with parallax gradient */}
        <motion.div style={{ y: heroBgY }} className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-900" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(16,185,129,0.15)_0%,_transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(5,150,105,0.1)_0%,_transparent_50%)]" />
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />
        </motion.div>

        {/* Back to Home button */}
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

        <motion.div style={{ opacity: heroOpacity }} className="relative z-10 w-full">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-24 lg:py-32">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              {/* Left — Text */}
              <div className="space-y-8">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  <span className="inline-flex items-center gap-2 text-emerald-300 bg-emerald-900/50 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium border border-emerald-700/50">
                    <Leaf className="w-4 h-4" />
                    About EcoKogi
                  </span>
                </motion.div>

                <motion.h1
                  className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.35 }}
                >
                  EcoKogi Smart{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-emerald-400">
                    Waste Management
                  </span>{' '}
                  Platform
                </motion.h1>

                <motion.p
                  className="text-lg sm:text-xl text-emerald-100/80 leading-relaxed max-w-lg"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                >
                  An AI-powered digital platform designed to support sustainable waste management,
                  recycling, and environmental monitoring across Kogi State — connecting citizens,
                  government agencies, and vendors in a unified ecosystem.
                </motion.p>

                <motion.div
                  className="flex flex-wrap gap-4 pt-4"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.65 }}
                >
                  <a
                    href="#mission"
                    className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-7 py-3.5 rounded-xl transition-all duration-300 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-400/40"
                  >
                    Our Mission
                    <ArrowRight className="w-4 h-4" />
                  </a>
                  <a
                    href="#tech"
                    className="inline-flex items-center gap-2 border border-emerald-700/50 text-emerald-200 hover:bg-emerald-800/50 font-semibold px-7 py-3.5 rounded-xl transition-all duration-300 backdrop-blur-sm"
                  >
                    Tech Stack
                    <Cpu className="w-4 h-4" />
                  </a>
                </motion.div>
              </div>

              {/* Right — Floating cards */}
              <motion.div
                className="hidden lg:grid grid-cols-2 gap-4"
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                {[
                  { icon: Recycle, value: 'Smart', label: 'Collection & Sorting' },
                  { icon: Globe, value: 'Real-time', label: 'Environmental Monitoring' },
                  { icon: Users, value: 'Community', label: 'Citizen Engagement' },
                  { icon: Shield, value: 'Compliant', label: 'Government Standards' },
                ].map((item, i) => (
                  <div
                    key={item.label}
                    className={`bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors ${i === 0 ? 'col-span-2' : ''}`}
                  >
                    <item.icon className="w-6 h-6 text-emerald-400 mb-3" />
                    <div className="text-2xl sm:text-3xl font-bold text-white">{item.value}</div>
                    <div className="text-sm text-emerald-200/70 mt-1">{item.label}</div>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent z-10" />
      </section>

      {/* ─── MISSION, VISION, OBJECTIVES ─── */}
      <section id="mission" className="py-24 lg:py-32 relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <FadeInSection>
            <SectionHeading
              label="Our Purpose"
              title="Mission, Vision & Objectives"
              description="EcoKogi is built on a clear mission to transform waste management in Kogi State through technology, community engagement, and environmental stewardship."
            />
          </FadeInSection>

          <div className="grid md:grid-cols-3 gap-8 mt-8">
            {/* Mission */}
            <motion.div
              custom={0}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              className="group relative bg-white border border-slate-100 rounded-2xl p-8 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-500"
            >
              <div className="w-14 h-14 rounded-xl bg-emerald-50 flex items-center justify-center mb-6 group-hover:bg-emerald-100 transition-colors">
                <Target className="w-7 h-7 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Our Mission</h3>
              <p className="text-slate-600 leading-relaxed">
                To promote cleaner communities and sustainable waste management practices across
                Kogi State through technology-driven solutions that connect citizens, government
                agencies, and recycling vendors in a transparent, efficient ecosystem.
              </p>
            </motion.div>

            {/* Vision */}
            <motion.div
              custom={1}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              className="group relative bg-white border border-slate-100 rounded-2xl p-8 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-500"
            >
              <div className="w-14 h-14 rounded-xl bg-emerald-50 flex items-center justify-center mb-6 group-hover:bg-emerald-100 transition-colors">
                <Eye className="w-7 h-7 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Our Vision</h3>
              <p className="text-slate-600 leading-relaxed">
                To become Kogi State's leading digital environmental management platform — setting
                the standard for how African States leverage technology to achieve zero waste,
                empower communities, and protect the environment for future generations.
              </p>
            </motion.div>

            {/* Objectives */}
            <motion.div
              custom={2}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              className="group relative bg-white border border-slate-100 rounded-2xl p-8 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-500"
            >
              <div className="w-14 h-14 rounded-xl bg-emerald-50 flex items-center justify-center mb-6 group-hover:bg-emerald-100 transition-colors">
                <Recycle className="w-7 h-7 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Key Objectives</h3>
              <ul className="space-y-3">
                {objectives.map((obj, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-600 text-sm leading-relaxed">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{obj.text}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── WASTE-TO-WEALTH ─── */}
      <section className="py-24 lg:py-32 bg-slate-50 relative">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-emerald-100/40 to-transparent rounded-full -translate-y-1/2 -translate-x-1/2" />
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <FadeInSection>
            <SectionHeading
              label="Waste-to-Wealth"
              title="Turning Waste into Economic Opportunity"
              description="EcoKogi's waste-to-wealth model transforms discarded materials into valuable resources, creating economic value while protecting the environment."
            />
          </FadeInSection>
          <CardGrid items={wasteToWealthPoints} />
        </div>
      </section>

      {/* ─── GOVERNMENT COLLABORATION ─── */}
      <section className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <FadeInSection>
            <SectionHeading
              label="Government Collaboration"
              title="Working with the Public Sector"
              description="EcoKogi partners with government agencies at state and local levels to deploy digital waste management solutions that serve the people of Kogi State."
            />
          </FadeInSection>
          <CardGrid items={govCollabPoints} />
        </div>
      </section>

      {/* ─── CITIZEN PARTICIPATION ─── */}
      <section className="py-24 lg:py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <FadeInSection>
            <SectionHeading
              label="Citizen Participation"
              title="Empowering Every Resident"
              description="At the heart of EcoKogi is the belief that lasting environmental change starts with informed, engaged citizens who have the tools to make a difference."
            />
          </FadeInSection>
          <CardGrid items={citizenPoints} />
        </div>
      </section>

      {/* ─── SDG ALIGNMENT & TECH STACK ─── */}
      <section id="tech" className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <FadeInSection>
            <SectionHeading
              label="SDG Alignment & Technology"
              title="Built for Impact, Aligned with Global Goals"
              description="EcoKogi's design and objectives are aligned with the United Nations Sustainable Development Goals, leveraging modern technology to deliver measurable environmental outcomes."
            />
          </FadeInSection>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* SDG Grid */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }}
            >
              <h3 className="text-xl font-bold text-slate-900 mb-6">Sustainable Development Goals</h3>
              <div className="grid grid-cols-2 gap-3">
                {sdgItems.map((sdg) => (
                  <div
                    key={sdg.code}
                    className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-xl p-4"
                  >
                    <Globe className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <div className="text-sm font-bold text-emerald-800">{sdg.code}</div>
                      <div className="text-xs text-slate-600">{sdg.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Tech Stack */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="bg-gradient-to-br from-emerald-900 to-slate-900 rounded-3xl p-8 lg:p-10 text-white"
            >
              <Cpu className="w-10 h-10 text-emerald-400 mb-6" />
              <h3 className="text-2xl font-bold mb-4">Tech Stack Highlights</h3>
              <ul className="space-y-3">
                {techStackItems.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-emerald-100/80">
                    <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── ACADEMIC NOTE ─── */}
      <section className="py-16 lg:py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <FadeInSection>
            <div className="bg-white border border-emerald-100 rounded-2xl p-8 lg:p-10 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                  <Sparkles className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Academic Project Status</h3>
                  <p className="text-slate-600 leading-relaxed text-sm">
                    EcoKogi is developed as a research and academic project to demonstrate how
                    modern web technologies — including AI, real-time databases, and geospatial
                    analytics — can be applied to solve real-world waste management challenges
                    in Kogi State, Nigeria. The platform showcases a scalable blueprint for
                    digital environmental governance that can be adapted by other regions.
                  </p>
                </div>
              </div>
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* ─── CTA ─── */}
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
                <Sparkles className="w-4 h-4" />
                Join the Movement
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-6">
                Ready to Build a Cleaner Kogi?
              </h2>
              <p className="text-lg text-emerald-100/70 max-w-2xl mx-auto mb-10 leading-relaxed">
                Whether you're a citizen ready to recycle, a government agency seeking solutions, or a partner
                looking to make an impact — there's a place for you at EcoKogi.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <button
                  onClick={onBack}
                  className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-400/40"
                >
                  <Sun className="w-5 h-5" />
                  Explore the Platform
                </button>
                <a
                  href="#mission"
                  className="inline-flex items-center gap-2 border border-emerald-700/50 text-emerald-200 hover:bg-emerald-800/50 font-semibold px-8 py-4 rounded-xl transition-all duration-300 backdrop-blur-sm"
                >
                  <Heart className="w-5 h-5" />
                  Learn About Our Mission
                </a>
              </div>
            </motion.div>
          </FadeInSection>
        </div>
      </section>
    </div>
  )
}

export default About