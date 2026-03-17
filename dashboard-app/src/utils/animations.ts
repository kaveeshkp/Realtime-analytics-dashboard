/**
 * Centralized animation presets and variants using Framer Motion
 * These can be reused across components for consistent animations
 */

import { Variants, Transition } from 'framer-motion';

// ============================================================================
// TRANSITION CONFIGURATIONS
// ============================================================================

export const TRANSITIONS = {
  quick: { duration: 0.2, ease: 'easeOut' } as Transition,
  normal: { duration: 0.3, ease: 'easeOut' } as Transition,
  smooth: { duration: 0.5, ease: [0.43, 0.13, 0.23, 0.96] } as Transition,
  bounce: { type: 'spring', stiffness: 400, damping: 10 } as Transition,
};

// ============================================================================
// PAGE & CONTAINER ANIMATIONS
// ============================================================================

export const pageVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 8,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: TRANSITIONS.normal,
  },
};

export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

// ============================================================================
// CARD & COMPONENT ANIMATIONS
// ============================================================================

export const cardVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 8,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: TRANSITIONS.normal,
  },
  hover: {
    scale: 1.02,
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
    transition: TRANSITIONS.quick,
  },
  tap: {
    scale: 0.98,
  },
};

export const fadeInVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: TRANSITIONS.normal,
  },
};

// ============================================================================
// SLIDE ANIMATIONS
// ============================================================================

export const slideUpVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: TRANSITIONS.normal,
  },
};

export const slideDownVariants: Variants = {
  hidden: {
    opacity: 0,
    y: -20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: TRANSITIONS.normal,
  },
};

export const slideLeftVariants: Variants = {
  hidden: {
    opacity: 0,
    x: -20,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: TRANSITIONS.normal,
  },
};

export const slideRightVariants: Variants = {
  hidden: {
    opacity: 0,
    x: 20,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: TRANSITIONS.normal,
  },
};

// ============================================================================
// SCALE ANIMATIONS
// ============================================================================

export const scaleInVariants: Variants = {
  hidden: {
    scale: 0,
    opacity: 0,
  },
  visible: {
    scale: 1,
    opacity: 1,
    transition: TRANSITIONS.bounce,
  },
};

export const scaleOutVariants: Variants = {
  visible: {
    scale: 1,
    opacity: 1,
  },
  hidden: {
    scale: 0,
    opacity: 0,
    transition: TRANSITIONS.quick,
  },
};

// ============================================================================
// TOOLTIP & POPUP ANIMATIONS
// ============================================================================

export const tooltipVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    y: -8,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: TRANSITIONS.quick,
  },
};

// ============================================================================
// SIDEBAR & OVERLAY ANIMATIONS
// ============================================================================

export const sidebarVariants: Variants = {
  hidden: {
    x: -300,
    opacity: 0,
  },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
  exit: {
    x: -300,
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: 'easeIn',
    },
  },
};

// ============================================================================
// ROW & LIST ITEM ANIMATIONS
// ============================================================================

export const rowVariants: Variants = {
  hidden: {
    opacity: 0,
    x: -10,
  },
  visible: (index: number = 0) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: index * 0.05,
      duration: 0.3,
    },
  }),
  hover: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    transition: TRANSITIONS.quick,
  },
};

export const listVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.2,
    },
  },
};

// ============================================================================
// CHART & DATA VISUALIZATION ANIMATIONS
// ============================================================================

export const chartContainerVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: TRANSITIONS.smooth,
  },
};

// ============================================================================
// ERROR & SUCCESS STATE ANIMATIONS
// ============================================================================

export const errorVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 10,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: TRANSITIONS.quick,
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: TRANSITIONS.quick,
  },
};

export const successVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: TRANSITIONS.bounce,
  },
};

// ============================================================================
// TOAST/NOTIFICATION ANIMATIONS
// ============================================================================

export const toastVariants: Variants = {
  hidden: {
    opacity: 0,
    x: 400,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    x: 400,
    transition: {
      duration: 0.2,
      ease: 'easeIn',
    },
  },
};

// ============================================================================
// LOADING & SKELETON ANIMATIONS
// ============================================================================

export const pulseVariants: Variants = {
  animate: {
    opacity: [0.4, 0.8, 0.4],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// ============================================================================
// HELPER FUNCTION: CREATE STAGGER WITH CUSTOM DELAY
// ============================================================================

export const createStaggerVariants = (baseDelay = 0.1): Variants => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: baseDelay,
      delayChildren: 0.1,
    },
  },
});

// ============================================================================
// PRESETS FOR COMMON PATTERNS
// ============================================================================

export const fadeInUp = (delay = 0): Variants => ({
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { ...TRANSITIONS.normal, delay },
  },
});

export const fadeInDown = (delay = 0): Variants => ({
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { ...TRANSITIONS.normal, delay },
  },
});

export const fadeInScale = (delay = 0): Variants => ({
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { ...TRANSITIONS.normal, delay },
  },
});
