import { useState, FC, ImgHTMLAttributes } from 'react';

interface OptimizedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string;
  fallbackSrc?: string;
  placeholderColor?: string;
}

/**
 * Optimized image component with:
 * - Lazy loading (native)
 * - Error handling with fallback
 * - Placeholder while loading
 * - Responsive sizing
 */
export const OptimizedImage: FC<OptimizedImageProps> = ({
  src,
  fallbackSrc = '🖼️',
  placeholderColor = 'rgba(255,255,255,0.05)',
  alt = 'Image',
  width = 24,
  height = 24,
  ...imgProps
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [imgError, setImgError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setImgError(true);
  };

  // Show fallback on error
  if (imgError && fallbackSrc && typeof fallbackSrc === 'string') {
    return (
      <div
        style={{
          width,
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: placeholderColor,
          borderRadius: 4,
          fontSize: width as number / 2,
        }}
      >
        {fallbackSrc}
      </div>
    );
  }

  return (
    <>
      {isLoading && (
        <div
          style={{
            width,
            height,
            background: placeholderColor,
            borderRadius: 4,
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          }}
        />
      )}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading="lazy"
        onLoad={handleLoad}
        onError={handleError}
        style={{
          display: isLoading ? 'none' : 'block',
          borderRadius: 4,
          ...imgProps.style,
        }}
        {...imgProps}
      />
    </>
  );
};
