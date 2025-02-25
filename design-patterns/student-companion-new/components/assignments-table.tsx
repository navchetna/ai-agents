import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MoreHorizontal, Check, X, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export type Assignment = {
  id: string
  course: string
  title: string
  dueDate: string
  status: "Not Started" | "Pending" | "In Progress" | "Completed"
  priority: "High" | "Medium" | "Low"
}

interface AssignmentsTableProps {
  assignments: Assignment[]
  onStatusChange: (id: string, newStatus: "Not Started" | "Pending" | "In Progress" | "Completed") => void
}

export function AssignmentsTable({ assignments, onStatusChange }: AssignmentsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Course</TableHead>
          <TableHead>Assignment</TableHead>
          <TableHead>Due Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Priority</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {assignments.map((assignment) => (
          <TableRow key={assignment.id}>
            <TableCell className="font-medium">{assignment.course}</TableCell>
            <TableCell>{assignment.title}</TableCell>
            <TableCell>{assignment.dueDate}</TableCell>
            <TableCell>
              <span
                className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${
                  assignment.status === "Completed"
                    ? "status-completed"
                    : assignment.status === "In Progress"
                      ? "status-in-progress"
                      : assignment.status === "Pending"
                        ? "status-pending"
                        : "status-not-started"
                }`}
              >
                {assignment.status}
              </span>
            </TableCell>
            <TableCell>
              <span
                className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${
                  assignment.priority === "High"
                    ? "bg-red-500 text-red-950 dark:bg-red-600 dark:text-red-100"
                    : assignment.priority === "Medium"
                      ? "bg-yellow-500 text-yellow-950 dark:bg-yellow-600 dark:text-yellow-100"
                      : "bg-green-500 text-green-950 dark:bg-green-600 dark:text-green-100"
                }`}
              >
                {assignment.priority}
              </span>
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => onStatusChange(assignment.id, "Not Started")}>
                    <X className="mr-2 h-4 w-4" /> Mark as Not Started
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onStatusChange(assignment.id, "Pending")}>
                    <Clock className="mr-2 h-4 w-4" /> Mark as Pending
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onStatusChange(assignment.id, "In Progress")}>
                    <MoreHorizontal className="mr-2 h-4 w-4" /> Mark as In Progress
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onStatusChange(assignment.id, "Completed")}>
                    <Check className="mr-2 h-4 w-4" /> Mark as Completed
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>View details</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

