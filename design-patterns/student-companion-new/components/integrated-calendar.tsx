import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChromeIcon as Google,
  Mail,
  ChevronLeft,
  ChevronRight,
  Star,
  Search,
} from "lucide-react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns";

type Event = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: "class" | "assignment" | "sports" | "other" | "holiday";
  location?: string;
  isSpecial?: boolean;
  color?: string;
};

type FilterState = {
  date: string;
  keyword: string;
  group: string;
  type: string;
};

const generateMonthEvents = (baseDate: Date): Event[] => {
  const month = baseDate.getMonth();
  const year = baseDate.getFullYear();

  // Regular weekly classes
  const weeklyClasses: Event[] = [
    {
      id: "math",
      title: "Mathematics",
      type: "class",
      color: "bg-blue-500",
      location: "Room 101",
    },
    {
      id: "science",
      title: "Science",
      type: "class",
      color: "bg-green-500",
      location: "Room 102",
    },
    {
      id: "english",
      title: "English",
      type: "class",
      color: "bg-purple-500",
      location: "Room 103",
    },
  ];

  // Generate events for the entire month
  const events: Event[] = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Add weekly classes
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay();

    // Add classes on weekdays
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      weeklyClasses.forEach((classEvent, index) => {
        events.push({
          ...classEvent,
          id: `${classEvent.id}-${day}`,
          start: new Date(year, month, day, 9 + index, 0),
          end: new Date(year, month, day, 10 + index, 30),
        });
      });
    }
  }

  // Add special events
  const specialEvents: Event[] = [
    {
      id: `assignment-1-${month}`,
      title: "Math Assignment Due",
      type: "assignment",
      color: "bg-red-500",
      start: new Date(year, month, 15, 23, 59),
      end: new Date(year, month, 15, 23, 59),
      isSpecial: true,
    },
    {
      id: `sports-1-${month}`,
      title: "Inter-School Sports Meet",
      type: "sports",
      color: "bg-orange-500",
      start: new Date(year, month, 20, 14, 0),
      end: new Date(year, month, 20, 17, 0),
      location: "School Ground",
      isSpecial: true,
    },
    {
      id: `holiday-1-${month}`,
      title: "Teacher's Day",
      type: "holiday",
      color: "bg-yellow-500",
      start: new Date(year, month, 5, 0, 0),
      end: new Date(year, month, 5, 23, 59),
      isSpecial: true,
    },
    {
      id: `other-1-${month}`,
      title: "Annual Day Practice",
      type: "other",
      color: "bg-pink-500",
      start: new Date(year, month, 12, 15, 0),
      end: new Date(year, month, 12, 17, 0),
      location: "Auditorium",
    },
  ];

  return [...events, ...specialEvents];
};

export function IntegratedCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    date: "",
    keyword: "",
    group: "All Groups",
    type: "All",
  });
  const [isListView, setIsListView] = useState(false);

  useEffect(() => {
    const monthEvents = generateMonthEvents(currentMonth);
    setEvents(monthEvents);
  }, [currentMonth]);

  const connectGoogle = () => {
    console.log("Google Calendar integration not implemented");
  };

  const connectOutlook = () => {
    console.log("Outlook Calendar integration not implemented");
  };

  const handlePreviousMonth = () => {
    setCurrentMonth((prev) => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => addMonths(prev, 1));
  };

  const resetEvents = () => {
    setEvents(generateMonthEvents(currentMonth));
  };

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters((prev) => {
      const newFilters = { ...prev, [key]: value };
      if (
        Object.values(newFilters).every(
          (v) => !v || v === "All Groups" || v === "All"
        )
      ) {
        resetEvents();
      }
      return newFilters;
    });
  };

  const handleFindEvents = () => {
    const filteredEvents = events.filter((event) => {
      const matchesDate = filters.date
        ? isSameDay(event.start, new Date(filters.date))
        : true;
      const matchesKeyword = filters.keyword
        ? event.title.toLowerCase().includes(filters.keyword.toLowerCase())
        : true;
      const matchesGroup =
        filters.group !== "All Groups"
          ? event.type === filters.group.toLowerCase()
          : true;
      const matchesType =
        filters.type !== "All"
          ? event.type === filters.type.toLowerCase()
          : true;

      return matchesDate && matchesKeyword && matchesGroup && matchesType;
    });

    setEvents(filteredEvents);
  };

  const renderCalendarDays = () => {
    const days = eachDayOfInterval({
      start: startOfMonth(currentMonth),
      end: endOfMonth(currentMonth),
    });

    const weeks: Date[][] = [];
    let currentWeek: Date[] = [];

    days.forEach((day) => {
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
      currentWeek.push(day);
    });

    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }

    return weeks.map((week, weekIndex) => (
      <tr key={weekIndex}>
        {week.map((day, dayIndex) => {
          const dayEvents = events.filter((event) =>
            isSameDay(event.start, day)
          );
          const isCurrentDay = isToday(day);
          const isCurrentMonth = isSameMonth(day, currentMonth);

          return (
            <td
              key={dayIndex}
              className={`border p-1 h-20 w-20 ${
                !isCurrentMonth ? "bg-gray-50" : ""
              } ${isCurrentDay ? "ring-2 ring-primary" : ""}`}
            >
              <div className="flex flex-col h-full">
                <span
                  className={`text-xs font-medium ${
                    isCurrentDay
                      ? "bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center"
                      : ""
                  }`}
                >
                  {format(day, "d")}
                </span>
                <div className="flex-1 overflow-hidden">
                  {/* Event stripes */}
                  <div className="flex flex-col gap-px mt-1">
                    {dayEvents.slice(0, 3).map((event) => (
                      <div
                        key={event.id}
                        className="group relative"
                        title={`${event.title} (${format(
                          event.start,
                          "h:mm a"
                        )} - ${format(event.end, "h:mm a")})`}
                      >
                        <div
                          className={`h-1 w-full ${
                            event.color || "bg-blue-500"
                          } rounded-sm`}
                        />
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-muted-foreground">
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </td>
          );
        })}
      </tr>
    ));
  };

  return (
    <Card className="w-full p-2">
      <CardHeader className="space-y-2 p-2">
        <div className="flex justify-between items-center">
          <CardTitle>Integrated Calendar</CardTitle>
          <div className="flex space-x-2">
            <Button onClick={connectGoogle} variant="outline" size="sm">
              <Google className="mr-2 h-4 w-4" />
              Connect Google
            </Button>
            <Button onClick={connectOutlook} variant="outline" size="sm">
              <Mail className="mr-2 h-4 w-4" />
              Connect Outlook
            </Button>
          </div>
        </div>
        <div className="flex flex-col space-y-2">
          <div className="flex justify-between items-center mb-2">
            <Button variant="outline" size="sm" onClick={handlePreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-lg font-bold">
              {format(currentMonth, "MMMM yyyy")}
            </h2>
            <Button variant="outline" size="sm" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-2">
            <Input
              placeholder="Date"
              value={filters.date}
              onChange={(e) => handleFilterChange("date", e.target.value)}
              className="h-8 text-sm"
            />
            <Input
              placeholder="Keyword"
              value={filters.keyword}
              onChange={(e) => handleFilterChange("keyword", e.target.value)}
              className="h-8 text-sm"
            />
            <Select
              value={filters.group}
              onValueChange={(value) => handleFilterChange("group", value)}
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="All Groups" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Groups">All Groups</SelectItem>
                <SelectItem value="Academic">Academic</SelectItem>
                <SelectItem value="Sports">Sports</SelectItem>
                <SelectItem value="Clubs">Clubs</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.type}
              onValueChange={(value) => handleFilterChange("type", value)}
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All</SelectItem>
                <SelectItem value="Class">Class</SelectItem>
                <SelectItem value="Assignment">Assignment</SelectItem>
                <SelectItem value="Sports">Sports</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex space-x-1">
              <Button
                className="h-8 text-xs px-2 flex-grow"
                onClick={handleFindEvents}
              >
                <Search className="h-3 w-3 mr-1" />
                Find
              </Button>
              <Button
                className="h-8 text-xs px-2"
                onClick={resetEvents}
                variant="outline"
              >
                Reset
              </Button>
              <Button
                variant="secondary"
                className="h-8 text-xs px-2"
                onClick={() => setIsListView(!isListView)}
              >
                {isListView ? "Grid" : "List"}
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-2">
        {isListView ? (
          <div className="space-y-1 max-h-[calc(100vh-300px)] overflow-y-auto">
            {events.map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between p-1 border rounded-lg text-sm"
              >
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      event.color || "bg-blue-500"
                    }`}
                  />
                  <div>
                    <p className="font-medium">{event.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(event.start, "PPp")} - {format(event.end, "p")}
                    </p>
                  </div>
                </div>
                {event.isSpecial && (
                  <Star className="h-3 w-3 text-yellow-500" />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                    (day) => (
                      <th
                        key={day}
                        className="border p-1 text-left font-medium text-sm"
                      >
                        {day}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>{renderCalendarDays()}</tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
