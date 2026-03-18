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
  PieChart,
  Activity,
  AlertCircle,
  CheckCircle,
  XCircle,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  Menu,
  X,
  Search,
  Settings,
  Bell,
  Eye,
  EyeOff,
  RefreshCw,
  Download,
  Upload,
  Zap,
} from 'lucide-react';

type IconVariant = 'default' | 'fill' | 'gradient' | 'outline' | 'bold';
type IconColor = 'default' | 'success' | 'danger' | 'warning' | 'info' | 'primary' | 'accent' | 'muted';

interface IconProps {
  name: string;
  size?: number;
  variant?: IconVariant;
  color?: IconColor;
  className?: string;
  animated?: boolean;
  hover?: boolean;
}

/**
 * Professional Icon component with multiple variants and colors
 * Maps icon names to lucide-react icons with styling
 */
export const Icon: React.FC<IconProps> = ({
  name,
  size = 18,
  variant = 'default',
  color = 'default',
  className = '',
  animated = false,
  hover = false,
}) => {
  // Color mapping for different contexts
  const colorMap: Record<IconColor, string> = {
    default: '#64748b',      // slate
    success: '#22d3a5',       // emerald/teal
    danger: '#f87171',        // red
    warning: '#facc15',       // yellow
    info: '#3b82f6',          // blue
    primary: '#22d3a5',       // primary brand color
    accent: '#f59e0b',        // amber accent
    muted: '#94a3b8',         // muted slate
  };

  const iconColor = colorMap[color];

  // Common animation classes
  const animationClass = animated ? 'animate-spin' : '';
  const hoverClass = hover ? 'group-hover:brightness-125 transition-all duration-300' : '';

  // Style props for the icons
  const commonProps = {
    size,
    strokeWidth: variant === 'bold' ? 2.5 : variant === 'outline' ? 1.5 : 2,
    color: iconColor,
    className: `transition-all duration-300 ${animationClass} ${hoverClass} ${className}`,
  };

  switch (name.toLowerCase()) {
    // Navigation Icons
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

    // Theme Icons
    case 'sun':
      return <Sun {...commonProps} />;

    case 'moon':
      return <Moon {...commonProps} />;

    // Status Icons
    case 'success':
      return <CheckCircle {...commonProps} />;

    case 'error':
    case 'danger':
      return <XCircle {...commonProps} />;

    case 'warning':
      return <AlertCircle {...commonProps} />;

    case 'info':
      return <Activity {...commonProps} />;

    // Action Icons
    case 'refresh':
    case 'reload':
      return <RefreshCw {...commonProps} />;

    case 'up':
    case 'increase':
      return <ArrowUp {...commonProps} />;

    case 'down':
    case 'decrease':
      return <ArrowDown {...commonProps} />;

    case 'right':
    case 'next':
      return <ArrowRight {...commonProps} />;

    case 'search':
      return <Search {...commonProps} />;

    case 'menu':
      return <Menu {...commonProps} />;

    case 'close':
    case 'x':
      return <X {...commonProps} />;

    case 'settings':
    case 'config':
      return <Settings {...commonProps} />;

    case 'bell':
    case 'notification':
      return <Bell {...commonProps} />;

    case 'eye':
    case 'view':
      return <Eye {...commonProps} />;

    case 'eye-off':
    case 'hide':
      return <EyeOff {...commonProps} />;

    case 'download':
      return <Download {...commonProps} />;

    case 'upload':
      return <Upload {...commonProps} />;

    case 'zap':
    case 'lightning':
      return <Zap {...commonProps} />;

    case 'pie':
    case 'pie-chart':
      return <PieChart {...commonProps} />;

    default:
      return <BarChart3 {...commonProps} />;
  }
};

export default Icon;

