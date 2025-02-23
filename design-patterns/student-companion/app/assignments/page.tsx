"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AssignmentsTable, type Assignment } from "@/components/assignments-table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"

const initialAssignments: Assignment[] = [
  {
    id: "1",
    course: "Mathematics",
    title: "Linear Algebra Problem Set",
    dueDate: "2023-08-25",
    status: "In Progress",
    priority: "High",
  },
  {
    id: "2",
    course: "History",
    title: "Essay on Industrial Revolution",
    dueDate: "2023-08-30",
    status: "Not Started",
    priority: "Medium",
  },
  {
    id: "3",
    course: "Physics",
    title: "Lab Report: Pendulum Experiment",
    dueDate: "2023-08-28",
    status: "Completed",
    priority: "Low",
  },
  {
    id: "4",
    course: "Chemistry",
    title: "Balancing Chemical Equations",
    dueDate: "2023-09-05",
    status: "Pending",
    priority: "Medium",
  },
]

export default function AssignmentsPage() {
  const [date, setDate] = useState<Date>()
  const [assignments, setAssignments] = useState<Assignment[]>(initialAssignments)

  const handleStatusChange = (id: string, newStatus: "Not Started" | "Pending" | "In Progress" | "Completed") => {
    setAssignments(
      assignments.map((assignment) => (assignment.id === id ? { ...assignment, status: newStatus } : assignment)),
    )
  }

  const notStartedAssignments = assignments.filter((a) => a.status === "Not Started")
  const pendingAssignments = assignments.filter((a) => a.status === "Pending")
  const inProgressAssignments = assignments.filter((a) => a.status === "In Progress")
  const completedAssignments = assignments.filter((a) => a.status === "Completed")

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold">Assignments</h1>
      <Tabs defaultValue="not-started">
        <TabsList>
          <TabsTrigger value="not-started">Not Started</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="add">Add New</TabsTrigger>
        </TabsList>
        <TabsContent value="not-started">
          <Card>
            <CardHeader>
              <CardTitle>Not Started Assignments</CardTitle>
            </CardHeader>
            <CardContent>
              <AssignmentsTable assignments={notStartedAssignments} onStatusChange={handleStatusChange} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Assignments</CardTitle>
            </CardHeader>
            <CardContent>
              <AssignmentsTable assignments={pendingAssignments} onStatusChange={handleStatusChange} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="in-progress">
          <Card>
            <CardHeader>
              <CardTitle>In Progress Assignments</CardTitle>
            </CardHeader>
            <CardContent>
              <AssignmentsTable assignments={inProgressAssignments} onStatusChange={handleStatusChange} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="completed">
          <Card>
            <CardHeader>
              <CardTitle>Completed Assignments</CardTitle>
            </CardHeader>
            <CardContent>
              <AssignmentsTable assignments={completedAssignments} onStatusChange={handleStatusChange} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="add">
          <Card>
            <CardHeader>
              <CardTitle>Add New Assignment</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Title
                  </label>
                  <Input id="title" placeholder="Assignment title" />
                </div>
                <div>
                  <label htmlFor="course" className="block text-sm font-medium text-gray-700">
                    Course
                  </label>
                  <Select>
                    <SelectTrigger id="course">
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="math">Mathematics</SelectItem>
                      <SelectItem value="science">Science</SelectItem>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="history">History</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
                    Due Date
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>
                <Button type="submit">Add Assignment</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

