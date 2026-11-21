import { useState } from 'react';
import { Coffee } from 'lucide-react';

interface CoffeeImageProps {
  src: string;
  alt: string;
  className?: string;
}

export function CoffeeImage({ src, alt, className = '' }: CoffeeImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#EDE9E0] to-[#DFD8CC] text-[#57534E] p-6 text-center ${className}`}
      >
        <Coffee className="w-8 h-8 mb-2 text-[#8B5A2B]" strokeWidth={1.5} />
        <span className="text-xs font-medium tracking-wide max-w-[180px] truncate">{alt}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
