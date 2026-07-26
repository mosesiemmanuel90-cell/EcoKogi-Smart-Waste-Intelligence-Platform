import React from 'react';
import { motion } from 'framer-motion';
import { Home, Compass, Leaf, MapPin, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';

interface NotFoundProps {
  onBack?: () => void;
  onGoHome?: () => void;
}

const floatingLeaf = {
  initial: { y: 0, rotate: 0, opacity: 0.6 },
  animate: (i: number) => ({
    y: [0, -20, 0],
    x: [0, i % 2 === 0 ? 15 : -15, 0],
    rotate: [0, i % 2 === 0 ? 15 : -15, 0],
    opacity: [0.6, 1, 0.6],
  }),
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};

export const NotFound: React.FC<NotFoundProps> = ({ onBack, onGoHome }) => {
  return (
    <div className="relative min-h-[100dvh] bg-gradient-to-b from-emerald-50 via-white to-emerald-50 dark:from-emerald-950 dark:via-zinc-950 dark:to-emerald-950 flex items-center justify-center overflow-hidden">
      {/* Floating leaves background */}
      <div className="absolute inset-0 pointer-events-none">
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            custom={i}
            variants={floatingLeaf}
            initial="initial"
            animate="animate"
            className="absolute text-emerald-300/30 dark:text-emerald-700/20"
            style={{
              top: `${15 + i * 18}%`,
              left: `${10 + i * 20}%`,
              fontSize: `${1.5 + i * 0.5}rem`,
            }}
          >
            <Leaf className="w-8 h-8 md:w-12 md:h-12" />
          </motion.div>
        ))}
      </div>

      {/* Decorative grid circles */}
      <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-emerald-200/20 dark:bg-emerald-800/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-emerald-300/15 dark:bg-emerald-700/10 rounded-full blur-3xl" />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="relative z-10 text-center px-6 max-w-lg"
      >
        {/* 404 status */}
        <motion.div variants={staggerItem} className="mb-6">
          <span className="inline-block text-[8rem] md:text-[10rem] font-black leading-none bg-gradient-to-b from-emerald-500 to-emerald-800 dark:from-emerald-400 dark:to-emerald-600 bg-clip-text text-transparent tracking-tighter">
            404
          </span>
        </motion.div>

        {/* Compass icon */}
        <motion.div
          variants={staggerItem}
          className="flex justify-center mb-6"
        >
          <motion.div
            animate={{ rotate: [0, 15, -15, 5, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="bg-emerald-100 dark:bg-emerald-900/50 p-4 rounded-2xl">
              <Compass className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
            </div>
          </motion.div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={staggerItem}
          className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 mb-3"
        >
          Lost in the Wilderness
        </motion.h1>

        {/* Subtext */}
        <motion.p
          variants={staggerItem}
          className="text-base text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-md mx-auto mb-8"
        >
          This route doesn't exist in Kogi State's waste management system. Let's guide you back to a place that does.
        </motion.p>

        {/* Action buttons */}
        <motion.div variants={staggerItem} className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {onGoHome && (
            <Button
              size="lg"
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-6 rounded-xl text-base font-semibold shadow-lg shadow-emerald-200/50 dark:shadow-emerald-900/30"
              onClick={onGoHome}
            >
              <Home className="w-5 h-5 mr-2" />
              Back to Home
            </Button>
          )}
          {onBack && (
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 px-8 py-6 rounded-xl text-base"
              onClick={onBack}
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Go Back
            </Button>
          )}
        </motion.div>

        {/* Helpful hint */}
        <motion.div
          variants={staggerItem}
          className="mt-8 flex items-center justify-center gap-2 text-sm text-zinc-400 dark:text-zinc-500"
        >
          <MapPin className="w-4 h-4" />
          <span>Try the navigation menu above to find your way</span>
        </motion.div>
      </motion.div>

      {/* Bottom decorative leaf */}
      <motion.div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 text-emerald-200/40 dark:text-emerald-800/30"
        animate={{ rotate: [0, 10, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Leaf className="w-6 h-6" />
      </motion.div>
    </div>
  );
};

export default NotFound;