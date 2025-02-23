import { Card } from "@/components/ui/card"
import type React from "react"
import Link from "next/link"

interface MetricsCardProps {
  title: string
  value: string
  change?: {
    value: string
    isPositive: boolean
  }
  icon: React.ReactNode
  href?: string
}

export function MetricsCard({ title, value, change, icon, href }: MetricsCardProps) {
  const CardWrapper = ({ children }: { children: React.ReactNode }) => {
    if (href) {
      return (
        <Link href={href} className="block h-full">
          {children}
        </Link>
      )
    }
    return <>{children}</>
  }

  return (
    <CardWrapper>
      <Card className="p-4 bg-background/50 backdrop-blur hover:bg-background/60 transition-all cursor-pointer h-full hover:scale-[1.02] hover:shadow-lg flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm text-muted-foreground">{title}</h3>
          {icon}
        </div>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-2xl font-bold">{value}</p>
            {change && (
              <div className="flex items-center gap-1 mt-1">
                <span className={`text-sm ${change.isPositive ? "text-green-500" : "text-red-500"}`}>
                  {change.value}
                </span>
              </div>
            )}
          </div>
        </div>
      </Card>
    </CardWrapper>
  )
}

