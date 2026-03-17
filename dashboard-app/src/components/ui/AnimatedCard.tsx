import { ReactNode } from 'react';
import { motion, MotionProps, Variants } from 'framer-motion';
import {
  cardVariants,
  fadeInVariants,
  slideUpVariants,
  slideDownVariants,
  slideLeftVariants,
  slideRightVariants,
  scaleInVariants,
  TRANSITIONS,
} from '../../utils/animations';

type AnimationType = 'card' | 'fadeIn' | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight' | 'scaleIn' | 'custom';

interface AnimatedCardProps extends Omit<MotionProps, 'children' | 'variants'> {
  children: ReactNode;
  delay?: number;
  duration?: number;
  direction?: 'up' | 'left' | 'right' | 'down';
  animationType?: AnimationType;
  variant?: Variants;
  hover?: boolean;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Animated card wrapper component with entrance animations
 * Provides consistent animation patterns across dashboard components
 */
export const AnimatedCard = ({
  children,
  delay = 0,
  duration = 0.3,
  animationType = 'card',
  direction = 'up',
  variant,
  hover = true,
  onClick,
  className,
  style,
  ...motionProps
}: AnimatedCardProps) => {
  // Determine animation variant based on type
  let selectedVariant: Variants = cardVariants;

  if (variant) {
    selectedVariant = variant;
  } else if (animationType === 'fadeIn') {
    selectedVariant = fadeInVariants;
  } else if (animationType === 'slideUp') {
    selectedVariant = slideUpVariants;
  } else if (animationType === 'slideDown') {
    selectedVariant = slideDownVariants;
  } else if (animationType === 'slideLeft') {
    selectedVariant = slideLeftVariants;
  } else if (animationType === 'slideRight') {
    selectedVariant = slideRightVariants;
  } else if (animationType === 'scaleIn') {
    selectedVariant = scaleInVariants;
  } else if (animationType === 'card') {
    // Add delay to card variant
    const cardVariantWithDelay = {
      hidden: cardVariants.hidden,
      visible: {
        ...cardVariants.visible,
        transition: { ...TRANSITIONS.normal, delay },
      },
    } as Variants;

    if (hover && cardVariants.hover) {
      cardVariantWithDelay.hover = cardVariants.hover;
    }
    if (cardVariants.tap) {
      cardVariantWithDelay.tap = cardVariants.tap;
    }

    selectedVariant = cardVariantWithDelay;
  }

  return (
    <motion.div
      variants={selectedVariant}
      initial="hidden"
      whileInView="visible"
      whileHover={hover ? 'hover' : undefined}
      whileTap={hover ? 'tap' : undefined}
      viewport={{ once: true, amount: 0.3 }}
      className={className}
      style={style}
      onClick={onClick}
      {...motionProps}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedCard;
