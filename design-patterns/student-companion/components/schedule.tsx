import { Badge } from "@/components/ui/badge"

const scheduleData = [
  { time: "09:00 AM", course: "English", room: "Room 101" },
  { time: "10:00 AM", course: "Hindi", room: "Room 102" },
  { time: "11:00 AM", course: "Mathematics", room: "Room 103" },
  { time: "12:00 PM", course: "Lunch Break", room: "Cafeteria" },
  { time: "01:00 PM", course: "Environmental Studies", room: "Room 104" },
  { time: "02:00 PM", course: "Arts Education", room: "Art Room" },
  { time: "03:00 PM", course: "Health and Physical Education", room: "Playground" },
]

export function Schedule() {
  return (
    <div className="space-y-4">
      {scheduleData.map((item, index) => (
        <div key={index} className="flex justify-between items-center">
          <div>
            <p className="font-medium">{item.course}</p>
            <p className="text-sm text-muted-foreground">{item.room}</p>
          </div>
          <Badge variant="outline">{item.time}</Badge>
        </div>
      ))}
    </div>
  )
}

