import { Card, CardContent, CardHeader, CardTitle } from "@/components/card";
import { Badge } from "@/components/badge";

type SportEvent = {
  id: string;
  title: string;
  type: "practice" | "match";
  time: string;
  location: string;
};

const sportsEvents: SportEvent[] = [
  {
    id: "1",
    title: "Football Practice",
    type: "practice",
    time: "3:00 PM - 5:00 PM",
    location: "School Field",
  },
  {
    id: "2",
    title: "Basketball vs. Riverside High",
    type: "match",
    time: "4:30 PM - 6:00 PM",
    location: "School Gym",
  },
  {
    id: "3",
    title: "Swimming Team Meeting",
    type: "practice",
    time: "5:00 PM - 6:00 PM",
    location: "Pool Area",
  },
];

export function SportsEvents() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sports Events</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sportsEvents.map((event) => (
            <div key={event.id} className="flex items-center justify-between">
              <div>
                <p className="font-medium">{event.title}</p>
                <p className="text-sm text-muted-foreground">
                  {event.location}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm">{event.time}</p>
                <Badge
                  variant={event.type === "practice" ? "secondary" : "default"}
                >
                  {event.type === "practice" ? "Practice" : "Match"}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
