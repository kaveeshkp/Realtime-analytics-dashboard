# Icon System Guide

Professional icon system using **lucide-react** with multiple variants, colors, and animations.

## Usage Examples

### Basic Navigation Icons

```tsx
import { Icon } from '@/components/ui/Icon';

// Navigation bar
<Icon name="home" size={16} color="primary" />
<Icon name="crypto" size={16} color="primary" />
<Icon name="sports" size={16} color="primary" />
<Icon name="stocks" size={16} color="primary" />
<Icon name="portfolio" size={16} color="primary" />
```

### Status Icons with Colors

```tsx
// Success state
<Icon name="success" color="success" />

// Error state
<Icon name="error" color="danger" />

// Warning state
<Icon name="warning" color="warning" />

// Info state
<Icon name="info" color="info" />
```

### Action Icons

```tsx
// Refresh/reload
<Icon name="refresh" animated={true} />

// Price movements
<Icon name="up" color="success" />
<Icon name="down" color="danger" />

// Theme toggle
<Icon name="sun" />
<Icon name="moon" />
```

### Icon Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | string | - | Icon name (required) |
| `size` | number | 18 | Icon size in pixels |
| `color` | IconColor | 'default' | Color scheme (success, danger, warning, info, primary, accent, muted) |
| `variant` | IconVariant | 'default' | Icon style (default, outline, bold, fill, gradient) |
| `animated` | boolean | false | Add spinning animation |
| `hover` | boolean | false | Add hover brightness effect |
| `className` | string | '' | Additional CSS classes |

## Color Schemes

### Brand Colors
```
primary:   #22d3a5  (Emerald - main brand)
accent:    #f59e0b  (Amber - accent color)
```

### Status Colors
```
success:   #22d3a5  (Green - positive)
danger:    #f87171  (Red - negative/errors)
warning:   #facc15  (Yellow - caution)
info:      #3b82f6  (Blue - information)
```

### Neutral Colors
```
default:   #64748b  (Slate - default)
muted:     #94a3b8  (Muted slate - secondary)
```

## Available Icons

### Navigation
- `home` / `overview` / `dashboard` → BarChart3
- `crypto` / `coins` → Coins
- `sports` / `trophy` → Trophy
- `stocks` / `cse` / `trending` → TrendingUp
- `portfolio` / `briefcase` → Briefcase
- `watchlist` / `star` / `favorite` → Star

### Theme
- `sun` → Sun
- `moon` → Moon

### Status
- `success` → CheckCircle
- `error` / `danger` → XCircle
- `warning` → AlertCircle
- `info` → Activity

### Actions
- `refresh` / `reload` → RefreshCw
- `up` / `increase` → ArrowUp
- `down` / `decrease` → ArrowDown
- `right` / `next` → ArrowRight
- `search` → Search
- `menu` → Menu
- `close` / `x` → X
- `settings` / `config` → Settings
- `bell` / `notification` → Bell
- `eye` / `view` → Eye
- `eye-off` / `hide` → EyeOff
- `download` → Download
- `upload` → Upload
- `zap` / `lightning` → Zap
- `pie` / `pie-chart` → PieChart

## Examples in Context

### Navigation Bar
```tsx
<button>
  <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
    <Icon name="crypto" size={16} color="primary" />
    Crypto
  </span>
</button>
```

### Status Badge
```tsx
<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
  <Icon name="success" color="success" size={20} />
  <span>Market Open</span>
</div>
```

### Data Table Row
```tsx
<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
  <span>{assetName}</span>
  <Icon name={price > 0 ? "up" : "down"} color={price > 0 ? "success" : "danger"} />
  <span>{price.toFixed(2)}%</span>
</div>
```

### Loading State
```tsx
<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
  <Icon name="refresh" animated={true} size={20} />
  <span>Loading...</span>
</div>
```

### Action Button
```tsx
<button style={{ display: "flex", alignItems: "center", gap: 6 }}>
  <Icon name="download" size={16} color="primary" />
  Download
</button>
```

## Professional Icon Usage Tips

1. **Consistency**: Always use the same icon for the same action
2. **Clarity**: Choose icons that clearly represent their function
3. **Size**: Use 16px for navigation, 20px for features, 24px for emphasis
4. **Colors**: Use colors meaningfully (green for success, red for errors)
5. **Animation**: Use spinning animation only for loading states
6. **Accessibility**: Always provide text labels alongside icons

## Customization

### Custom Styling
```tsx
<Icon
  name="crypto"
  size={18}
  color="primary"
  className="hover:scale-110"
/>
```

### Animated Icons
```tsx
// Loading spinner
<Icon name="refresh" animated={true} />

// Hover Effects
<Icon name="star" hover={true} />
```

## Integration with Components

The Icon component is already integrated in:
- ✅ Navbar (navigation items)
- ✅ Navbar (theme toggle)
- ✅ Navbar (watchlist button)
- Ready to integrate in:
  - Error/Status messages
  - Data table headers
  - Action buttons
  - Loading states
  - Status badges
