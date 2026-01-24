import { Clock, UserCheck, ShieldAlert, Home } from "lucide-react"
import { StatusPenahanan } from "@prisma/client"

interface StatusBadgeProps {
  status: StatusPenahanan
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config: Record<StatusPenahanan, {
    label: string
    icon: React.ComponentType<{ size?: number; className?: string }>
    className: string
  }> = {
    MAPENALING: {
      label: "Mapenaling",
      icon: Clock,
      className: "bg-orange-50 text-orange-700 border-orange-200"
    },
    NORMAL: {
      label: "Normal",
      icon: UserCheck,
      className: "bg-blue-50 text-blue-700 border-blue-200"
    },
    ISOLASI: {
      label: "Isolasi",
      icon: ShieldAlert,
      className: "bg-red-50 text-red-700 border-red-200"
    },
    KARANTINA: {
      label: "Karantina",
      icon: Home,
      className: "bg-yellow-50 text-yellow-700 border-yellow-200"
    }
  }

  const { label, icon: Icon, className } = config[status]

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${className}`}>
      <Icon size={14} />
      {label}
    </span>
  )
}