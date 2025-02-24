import { IntegratedCalendar } from "@/components/integrated-calendar"
import { SportsEvents } from "@/components/sports-events"
import { TodaysEvents } from "@/components/todays-events"

export default function SchedulePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Schedule</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <TodaysEvents />
        <SportsEvents />
      </div>
      <IntegratedCalendar />
    </div>
  )
}

