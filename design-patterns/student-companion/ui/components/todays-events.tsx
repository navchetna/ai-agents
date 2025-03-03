import { Card, CardContent, CardHeader, CardTitle } from "@/components/card";
import { Badge } from "@/components/badge";

type Event = {
  id: string;
  title: string;
  time: string;
  type: "class" | "assignment" | "sports" | "other";
};

const todaysEvents: Event[] = [
  { id: "1", title: "Mathematics", time: "09:00 AM - 10:30 AM", type: "class" },
  { id: "2", title: "History Essay Due", time: "11:59 PM", type: "assignment" },
  {
    id: "3",
    title: "Football Practice",
    time: "03:00 PM - 05:00 PM",
    type: "sports",
  },
  { id: "4", title: "Study Group", time: "06:00 PM - 07:30 PM", type: "other" },
];

export function TodaysEvents() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Today's Events</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {todaysEvents.map((event) => (
            <div key={event.id} className="flex items-center justify-between">
              <div>
                <p className="font-medium">{event.title}</p>
                <p className="text-sm text-muted-foreground">{event.time}</p>
              </div>
              <Badge
                variant={
                  event.type === "class"
                    ? "default"
                    : event.type === "assignment"
                    ? "destructive"
                    : event.type === "sports"
                    ? "secondary"
                    : "outline"
                }
              >
                {event.type}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
