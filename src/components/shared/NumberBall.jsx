const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-12 h-12 text-sm',
  lg: 'w-16 h-16 text-lg',
}

const variantClasses = {
  neutral: 'bg-[#1e293b] text-white border border-[#334155]',
  hot: 'bg-[#f59e0b] text-[#0f172a] font-bold',
  cold: 'bg-[#14b8a6] text-[#0f172a] font-bold',
  selected: 'bg-[#f59e0b]/20 border-2 border-[#f59e0b] text-[#f59e0b] font-bold',
  generated: 'bg-[#f59e0b] text-[#0f172a] font-bold animate-bounce-once',
}

export default function NumberBall({ number, variant = 'neutral', size = 'md', onClick, className = '' }) {
  return (
    <div
      className={[
        'rounded-full flex items-center justify-center font-mono cursor-default select-none transition-all',
        sizeClasses[size] ?? sizeClasses.md,
        variantClasses[variant] ?? variantClasses.neutral,
        onClick ? 'cursor-pointer hover:scale-110' : '',
        className,
      ].join(' ')}
      onClick={onClick}
    >
      {number}
    </div>
  )
}
