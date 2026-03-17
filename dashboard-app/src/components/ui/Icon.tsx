import React from 'react';
import {
  BarChart3,
  Coins,
  Trophy,
  TrendingUp,
  Briefcase,
  Star,
  Sun,
  Moon,
} from 'lucide-react';

interface IconProps {
  name: string;
  size?: number;
  className?: string;
}

/**
 * Icon component that maps icon names to lucide-react icons
 * Used throughout the app for consistent iconography
 */
export const Icon: React.FC<IconProps> = ({
  name,
  size = 18,
  className = '',
}) => {
  const commonProps = {
    size,
    strokeWidth: 2.5,
    className: `transition-colors ${className}`,
  };

  switch (name.toLowerCase()) {
    case 'home':
    case 'overview':
    case 'dashboard':
      return <BarChart3 {...commonProps} />;

    case 'crypto':
    case 'coins':
      return <Coins {...commonProps} />;

    case 'sports':
    case 'trophy':
      return <Trophy {...commonProps} />;

    case 'stocks':
    case 'cse':
    case 'trending':
      return <TrendingUp {...commonProps} />;

    case 'portfolio':
    case 'briefcase':
      return <Briefcase {...commonProps} />;

    case 'watchlist':
    case 'star':
    case 'favorite':
      return <Star {...commonProps} />;

    case 'sun':
      return <Sun {...commonProps} />;

    case 'moon':
      return <Moon {...commonProps} />;

    default:
      return <BarChart3 {...commonProps} />;
  }
};

export default Icon;
