const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-12 h-12 text-sm',
  lg: 'w-16 h-16 text-lg',
}

export default function AdditionalBall({ number, size = 'md', className = '' }) {
  return (
    <div className={['flex flex-col items-center gap-1', className].join(' ')}>
      <div
        className={[
          'rounded-full flex items-center justify-center font-mono font-bold',
          'bg-[#14b8a6]/20 border-2 border-[#14b8a6] text-[#14b8a6]',
          sizeClasses[size] ?? sizeClasses.md,
        ].join(' ')}
      >
        {number}
      </div>
      <span className="text-[10px] text-[#14b8a6] font-mono uppercase tracking-wider">
        Bonus
      </span>
    </div>
  )
}
