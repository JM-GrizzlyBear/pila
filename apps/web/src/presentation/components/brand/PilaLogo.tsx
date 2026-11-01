// The Pila logo: three people in line, the one at the front (amber) being served
export function PilaLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <rect width="64" height="64" rx="14" fill="#0f1b2d" />
      <circle cx="16" cy="25" r="5" fill="#8ea3c2" />
      <path d="M10 49V41a6 6 0 0 1 12 0v8Z" fill="#8ea3c2" />
      <circle cx="31" cy="25" r="5" fill="#ffffff" />
      <path d="M25 49V41a6 6 0 0 1 12 0v8Z" fill="#ffffff" />
      <circle cx="47" cy="23" r="5.5" fill="#f5a524" />
      <path d="M40.5 49V40a6.5 6.5 0 0 1 13 0v9Z" fill="#f5a524" />
    </svg>
  );
}
