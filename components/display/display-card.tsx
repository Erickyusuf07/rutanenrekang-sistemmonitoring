interface DisplayCardProps {
  title: string
  color: 'blue' | 'green' | 'purple' | 'orange' | 'cyan' | 'pink'
  children: React.ReactNode
  icon?: React.ReactNode
}

export default function DisplayCard({ title, color, children, icon }: DisplayCardProps) {
  const colorClasses = {
    blue: {
      gradient: 'bg-gradient-modern-blue',
      glow: 'shadow-[0_0_30px_rgba(102,126,234,0.4)]',
      border: 'border-blue-400/30'
    },
    green: {
      gradient: 'bg-gradient-modern-green',
      glow: 'shadow-[0_0_30px_rgba(17,153,142,0.4)]',
      border: 'border-green-400/30'
    },
    purple: {
      gradient: 'bg-gradient-modern-purple',
      glow: 'shadow-[0_0_30px_rgba(238,9,121,0.4)]',
      border: 'border-purple-400/30'
    },
    orange: {
      gradient: 'bg-gradient-modern-orange',
      glow: 'shadow-[0_0_30px_rgba(240,147,251,0.4)]',
      border: 'border-orange-400/30'
    },
    cyan: {
      gradient: 'bg-gradient-modern-cyan',
      glow: 'shadow-[0_0_30px_rgba(79,172,254,0.4)]',
      border: 'border-cyan-400/30'
    },
    pink: {
      gradient: 'bg-gradient-modern-pink',
      glow: 'shadow-[0_0_30px_rgba(250,112,154,0.4)]',
      border: 'border-pink-400/30'
    }
  }

  const styles = colorClasses[color]

  return (
    <div className={`relative flex flex-col overflow-hidden rounded-2xl ${styles.glow} ${styles.border} border-2 backdrop-blur-xl bg-white/5 hover:scale-[1.01] transition-all duration-300 h-full`}>
      {/* GRADIENT OVERLAY */}
      <div className="absolute inset-0 bg-linear-to-br from-white/10 to-transparent pointer-events-none"></div>
      
      {/* ANIMATED BACKGROUND DOTS */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-5 left-5 w-20 h-20 bg-white rounded-full blur-2xl animate-float"></div>
        <div className="absolute bottom-5 right-5 w-24 h-24 bg-white rounded-full blur-2xl animate-float" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* HEADER */}
      <div className={`relative shrink-0 ${styles.gradient} text-white px-4 py-3`}>
        <div className="flex items-center gap-2">
          {icon && <div className="text-2xl animate-float shrink-0">{icon}</div>}
          <h3 className="text-xl font-bold tracking-tight flex-1 truncate">{title}</h3>
          <div className="w-2 h-2 bg-white rounded-full animate-pulse shrink-0"></div>
        </div>
      </div>
      
      {/* CONTENT */}
      <div className="relative flex-1 p-4 bg-linear-to-b from-transparent to-white/5 overflow-hidden">
        {children}
      </div>

      {/* BOTTOM ACCENT LINE */}
      <div className={`h-1 shrink-0 ${styles.gradient}`}></div>
    </div>
  )
}