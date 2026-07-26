import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Home, Bug, AlertTriangle, WifiOff, RotateCcw, Leaf } from 'lucide-react';
import { Button } from '../components/ui/button';

interface ServerErrorProps {
  error?: Error;
  errorInfo?: React.ErrorInfo;
  onRetry?: () => void;
  onGoHome?: () => void;
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
};

const pulseRing = {
  initial: { scale: 0.8, opacity: 0.5 },
  animate: {
    scale: [0.8, 1.1, 0.8],
    opacity: [0.5, 0.2, 0.5],
    transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
  },
};

export const ServerError: React.FC<ServerErrorProps> = ({ error, onRetry, onGoHome }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="relative min-h-[100dvh] bg-gradient-to-b from-amber-50 via-white to-amber-50 dark:from-amber-950 dark:via-zinc-950 dark:to-amber-950 flex items-center justify-center overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-amber-200/20 dark:bg-amber-800/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 right-1/4 w-56 h-56 bg-emerald-200/15 dark:bg-emerald-800/10 rounded-full blur-3xl" />

      {/* Pulsing ring */}
      <motion.div
        variants={pulseRing}
        initial="initial"
        animate="animate"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full border-2 border-amber-200/20 dark:border-amber-700/10 pointer-events-none"
      />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="relative z-10 text-center px-6 max-w-lg"
      >
        {/* 500 status */}
        <motion.div variants={staggerItem} className="mb-6">
          <span className="inline-block text-[8rem] md:text-[10rem] font-black leading-none bg-gradient-to-b from-amber-500 to-amber-700 dark:from-amber-400 dark:to-amber-600 bg-clip-text text-transparent tracking-tighter">
            500
          </span>
        </motion.div>

        {/* Warning icon */}
        <motion.div
          variants={staggerItem}
          className="flex justify-center mb-6"
        >
          <motion.div
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="bg-amber-100 dark:bg-amber-900/50 p-4 rounded-2xl">
              <AlertTriangle className="w-10 h-10 text-amber-600 dark:text-amber-400" />
            </div>
          </motion.div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={staggerItem}
          className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 mb-3"
        >
          System Composting
        </motion.h1>

        {/* Subtext */}
        <motion.p
          variants={staggerItem}
          className="text-base text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-md mx-auto mb-2"
        >
          Our recycling system hit a temporary snag. We're breaking it down and turning it into something better — just give us a moment.
        </motion.p>

        <motion.p
          variants={staggerItem}
          className="text-sm text-zinc-400 dark:text-zinc-500 mb-8"
        >
          If this persists, please report the issue to our support team.
        </motion.p>

        {/* Action buttons */}
        <motion.div variants={staggerItem} className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {onRetry && (
            <Button
              size="lg"
              className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white px-8 py-6 rounded-xl text-base font-semibold shadow-lg shadow-amber-200/50 dark:shadow-amber-900/30"
              onClick={onRetry}
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Retry
            </Button>
          )}
          {onGoHome && (
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/30 px-8 py-6 rounded-xl text-base"
              onClick={onGoHome}
            >
              <Home className="w-5 h-5 mr-2" />
              Back to Home
            </Button>
          )}
        </motion.div>

        {/* Error details toggle */}
        <motion.div variants={staggerItem} className="mt-8">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="inline-flex items-center gap-2 text-sm text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
          >
            <Bug className="w-4 h-4" />
            {showDetails ? 'Hide' : 'Show'} error details
          </button>

          {showDetails && error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 p-4 bg-zinc-100 dark:bg-zinc-900 rounded-xl text-left overflow-auto max-h-48"
            >
              <code className="text-xs text-zinc-600 dark:text-zinc-400 font-mono whitespace-pre-wrap break-all">
                {error.name}: {error.message}
                {error.stack && `

${error.stack}`}
              </code>
            </motion.div>
          )}
        </motion.div>

        {/* Status indicator */}
        <motion.div
          variants={staggerItem}
          className="mt-6 flex items-center justify-center gap-2 text-sm text-zinc-400 dark:text-zinc-500"
        >
          <WifiOff className="w-4 h-4" />
          <span>Service temporarily disrupted</span>
        </motion.div>
      </motion.div>

      {/* Bottom decorative */}
      <motion.div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 text-amber-200/40 dark:text-amber-800/30 flex items-center gap-2"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <RotateCcw className="w-5 h-5" />
        <Leaf className="w-4 h-4" />
      </motion.div>
    </div>
  );
};

export default ServerError;