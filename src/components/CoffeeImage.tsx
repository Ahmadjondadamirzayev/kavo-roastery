import { useEffect, useState } from 'react';
import { Coffee } from 'lucide-react';
import { resolveCoffeeImage } from '../lib/coffeeImages';

interface CoffeeImageProps {
  src: string;
  alt: string;
  slug?: string;
  category?: string;
  className?: string;
}

export function CoffeeImage({
  src,
  alt,
  slug,
  category,
  className = '',
}: CoffeeImageProps) {
  const resolvedSrc = resolveCoffeeImage(src, slug, category);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [resolvedSrc]);

  if (failed || !resolvedSrc) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#1C1613] to-[#0E0B0A] text-[#B8ABA0] p-6 text-center ${className}`}
      >
        <Coffee className="w-8 h-8 mb-2 text-[#D4A373]" strokeWidth={1.5} />
        <span className="text-xs font-medium tracking-wide max-w-[180px] truncate text-[#FAF6F0]">
          {alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
