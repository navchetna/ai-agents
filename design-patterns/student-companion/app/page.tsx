import { Box, Typography, Grid, Card, CardContent } from "@mui/material"
import { Schedule } from "@/components/schedule"
import { AssignmentsTable, type Assignment } from "@/components/assignments-table"
import { MetricsCard } from "@/components/metrics-card"
import { Book, Assignment as AssignmentIcon, BarChart } from "@mui/icons-material"

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
    course: "Chemistry",
    title: "Balancing Chemical Equations",
    dueDate: "2023-09-05",
    status: "Pending",
    priority: "Medium",
  },
]

export default function Dashboard() {
  return (
    <Box sx={{ maxWidth: 1200, margin: "auto", py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="subtitle1" gutterBottom sx={{ color: "text.secondary" }}>
        Welcome back, John Doe!
      </Typography>

      {/* Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <MetricsCard title="Courses" value="5" icon={<Book />} href="/courses" />
        </Grid>
        <Grid item xs={12} sm={4}>
          <MetricsCard
            title="Assignments Due"
            value="3"
            change={{
              value: "3 this week",
              isPositive: false,
            }}
            icon={<AssignmentIcon />}
            href="/assignments"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <MetricsCard
            title="Overall Grade"
            value="91%"
            change={{
              value: "+2% from last semester",
              isPositive: true,
            }}
            icon={<BarChart />}
            href="/grades"
          />
        </Grid>
      </Grid>

      {/* Schedule and Assignments */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: "100%", bgcolor: "background.paper" }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Today's Schedule
              </Typography>
              <Schedule />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: "100%", bgcolor: "background.paper" }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Upcoming Assignments
              </Typography>
              <AssignmentsTable
                assignments={initialAssignments}
                onStatusChange={() => {}} // This is a placeholder as we can't update state here
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

