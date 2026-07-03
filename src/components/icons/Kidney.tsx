import { LucideProps } from 'lucide-react';

export function Kidney({ className, ...props }: LucideProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth={0.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Left lobe */}
      <path d="M10 3C7.5 3 5.5 5 5 7.5C4.5 10 5 12.5 6 14.5C7 16.5 8 18 8.5 20V21H12V3H10Z" opacity="0.85" />
      {/* Right lobe */}
      <path d="M14 3C16.5 3 18.5 5 19 7.5C19.5 10 19 12.5 18 14.5C17 16.5 16 18 15.5 20V21H12V3H14Z" opacity="0.85" />
      {/* Central vein */}
      <line x1="12" y1="8" x2="12" y2="18" opacity="0.3" strokeWidth="1" />
    </svg>
  );
}
