// MutualMatchCelebration Component - Celebration Animation for Mutual Waves
// Sprint 3: Wave UI Components with Celebration Animations

'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WaveWithUsers } from '@/types/wave';

interface MutualMatchCelebrationProps {
  /** Show celebration animation */
  show?: boolean;
  /** Visible state (alternative to show) */
  isVisible?: boolean;
  /** The mutual wave that triggered celebration */
  wave?: WaveWithUsers;
  /** User info for celebration */
  user?: {
    id: string;
    name: string;
    avatar?: string;
    location?: string;
  };
  /** Duration of celebration in milliseconds */
  duration?: number;
  /** Callback when celebration completes */
  onComplete?: () => void;
  /** Callback when closed */
  onClose?: () => void;
  /** Custom className */
  className?: string;
}

export const MutualMatchCelebration: React.FC<MutualMatchCelebrationProps> = ({
  show,
  isVisible: externalIsVisible,
  wave,
  user,
  duration = 3000,
  onComplete,
  onClose,
  className = '',
}) => {
  const [internalIsVisible, setInternalIsVisible] = React.useState(false);
  const isVisible = externalIsVisible !== undefined ? externalIsVisible : (show !== undefined ? show : internalIsVisible);

  React.useEffect(() => {
    if (show) {
      setInternalIsVisible(true);
      const timer = setTimeout(() => {
        setInternalIsVisible(false);
        onComplete?.();
        onClose?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show, duration, onComplete, onClose]);

  // Confetti particle animation
  const confettiVariants = {
    hidden: {
      opacity: 0,
      scale: 0,
      y: -50,
    },
    visible: (i: number) => ({
      opacity: [0, 1, 1, 0],
      scale: [0, 1, 1, 0],
      y: [0, -100, 200],
      x: [0, Math.random() * 200 - 100],
      rotate: [0, 360 * (Math.random() > 0.5 ? 1 : -1)],
      transition: {
        duration: 2,
        delay: i * 0.1,
        ease: "easeOut"
      }
    })
  };

  // Main celebration container animation
  const celebrationVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        staggerChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      scale: 1.2,
      transition: {
        duration: 0.5
      }
    }
  };

  // Text animation variants
  const textVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25
      }
    }
  };

  // Heart animation variants
  const heartVariants = {
    hidden: { scale: 0 },
    visible: {
      scale: [0, 1.2, 1],
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    },
    pulse: {
      scale: [1, 1.1, 1],
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  // Wave hands animation
  const waveHandsVariants = {
    hidden: { rotate: 0, scale: 0 },
    visible: {
      rotate: [0, 20, -10, 15, -5, 0],
      scale: [0, 1, 1, 1, 1, 1],
      transition: {
        duration: 1.5,
        repeat: 2,
        ease: "easeInOut"
      }
    }
  };

  // Generate confetti particles
  const confettiParticles = Array.from({ length: 20 }, (_, i) => i);
  const confettiColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];

  return (
    <AnimatePresence>
      {(show || isVisible) && (
        <motion.div
          className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 ${className}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-label="Mutual wave match celebration"
          aria-live="assertive"
        >
          {/* Confetti particles */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {confettiParticles.map((i) => (
              <motion.div
                key={i}
                className="absolute w-4 h-4 rounded-full"
                style={{
                  backgroundColor: confettiColors[i % confettiColors.length],
                  left: `${50 + (Math.random() - 0.5) * 40}%`,
                  top: '60%',
                }}
                variants={confettiVariants}
                initial="hidden"
                animate="visible"
                custom={i}
              />
            ))}
          </div>

          {/* Main celebration card */}
          <motion.div
            className="relative bg-white rounded-2xl shadow-2xl p-8 mx-4 max-w-md w-full text-center"
            variants={celebrationVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Sparkles background */}
            <div className="absolute inset-0 pointer-events-none">
              {Array.from({ length: 8 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute text-yellow-400 text-2xl"
                  style={{
                    left: `${10 + i * 10}%`,
                    top: `${20 + (i % 3) * 20}%`,
                  }}
                  animate={{
                    scale: [0, 1, 0],
                    rotate: [0, 180, 360],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 2,
                    delay: i * 0.2,
                    repeat: Infinity,
                    repeatDelay: 1,
                  }}
                >
                  ✨
                </motion.div>
              ))}
            </div>

            {/* Main content */}
            <motion.div variants={textVariants} className="relative z-10">
              {/* Large celebration emoji */}
              <motion.div
                className="text-8xl mb-4"
                variants={heartVariants}
                animate={["visible", "pulse"]}
              >
                🎉
              </motion.div>

              {/* Celebration title */}
              <motion.h2
                className="text-2xl font-bold text-gray-900 mb-2"
                variants={textVariants}
              >
                It&apos;s a Match!
              </motion.h2>

              {/* Wave hands */}
              <motion.div
                className="flex justify-center items-center gap-4 mb-4"
                variants={waveHandsVariants}
              >
                <span className="text-4xl">👋</span>
                <motion.div
                  className="text-3xl"
                  variants={heartVariants}
                  animate={["visible", "pulse"]}
                >
                  💖
                </motion.div>
                <span className="text-4xl">👋</span>
              </motion.div>

              {/* Match description */}
              <motion.p
                className="text-gray-600 mb-6"
                variants={textVariants}
              >
                You and {wave?.fromUser.name || wave?.toUser.name || 'another traveler'} both waved at each other!
              </motion.p>

              {/* User avatars */}
              {wave && (
                <motion.div
                  className="flex justify-center items-center gap-4 mb-6"
                  variants={textVariants}
                >
                  {/* From user */}
                  <div className="text-center">
                    {wave.fromUser.avatar ? (
                      <img
                        src={wave.fromUser.avatar}
                        alt={wave.fromUser.name}
                        className="w-16 h-16 rounded-full object-cover mx-auto mb-2 border-4 border-blue-200"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2 border-4 border-blue-200">
                        <span className="text-blue-600 font-bold text-xl">
                          {wave.fromUser.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <p className="text-sm font-medium text-gray-900">
                      {wave.fromUser.name}
                    </p>
                  </div>

                  {/* Connection indicator */}
                  <motion.div
                    className="flex flex-col items-center"
                    animate={{
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                    }}
                  >
                    <div className="w-1 h-8 bg-gradient-to-b from-blue-400 to-pink-400 rounded-full mb-1"></div>
                    <div className="text-2xl">🔗</div>
                    <div className="w-1 h-8 bg-gradient-to-t from-blue-400 to-pink-400 rounded-full mt-1"></div>
                  </motion.div>

                  {/* To user */}
                  <div className="text-center">
                    {wave.toUser.avatar ? (
                      <img
                        src={wave.toUser.avatar}
                        alt={wave.toUser.name}
                        className="w-16 h-16 rounded-full object-cover mx-auto mb-2 border-4 border-pink-200"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-2 border-4 border-pink-200">
                        <span className="text-pink-600 font-bold text-xl">
                          {wave.toUser.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <p className="text-sm font-medium text-gray-900">
                      {wave.toUser.name}
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Call to action */}
              <motion.div
                className="space-y-3"
                variants={textVariants}
              >
                <p className="text-sm text-gray-500">
                  You can now message each other and plan adventures together!
                </p>

                <motion.button
                  className="w-full bg-gradient-to-r from-blue-500 to-pink-500 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-600 hover:to-pink-600 transition-all duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setInternalIsVisible(false);
                    onComplete?.();
                    onClose?.();
                  }}
                  aria-label="Start messaging"
                >
                  Start Messaging ✨
                </motion.button>
              </motion.div>
            </motion.div>

            {/* Close button */}
            <motion.button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl"
              onClick={() => {
                setInternalIsVisible(false);
                onComplete?.();
                onClose?.();
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Close celebration"
            >
              ×
            </motion.button>
          </motion.div>

          {/* Background floating hearts */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {Array.from({ length: 6 }).map((_, i) => (
              <motion.div
                key={`heart-${i}`}
                className="absolute text-red-300 text-3xl"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [-20, -100],
                  opacity: [0, 1, 0],
                  scale: [0.5, 1, 0.5],
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 3,
                  delay: i * 0.5,
                  repeat: Infinity,
                  ease: "easeOut"
                }}
              >
                💖
              </motion.div>
            ))}
          </div>

          {/* Screen reader announcement */}
          <div className="sr-only" aria-live="assertive">
            Congratulations! You have a mutual wave match with {wave?.fromUser.name || wave?.toUser.name || 'another traveler'}. You can now message each other.
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MutualMatchCelebration;