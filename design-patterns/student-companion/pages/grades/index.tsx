import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BarChart, Calendar, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

type Grade = {
  subject: string;
  grade: string;
  percentage: number;
  status: "improved" | "declined" | "unchanged";
};

type Semester = {
  name: string;
  averagePercentage: number;
  grades: Grade[];
};

const previousSemesters: Semester[] = [
  {
    name: "Term 1",
    averagePercentage: 88,
    grades: [
      { subject: "English", grade: "A", percentage: 92, status: "improved" },
      { subject: "Hindi", grade: "B+", percentage: 87, status: "unchanged" },
      {
        subject: "Mathematics",
        grade: "A-",
        percentage: 89,
        status: "declined",
      },
      {
        subject: "Environmental Studies",
        grade: "B",
        percentage: 84,
        status: "improved",
      },
      {
        subject: "Arts Education",
        grade: "A",
        percentage: 95,
        status: "unchanged",
      },
      {
        subject: "Health and Physical Education",
        grade: "A-",
        percentage: 90,
        status: "improved",
      },
    ],
  },
  {
    name: "Term 2",
    averagePercentage: 90,
    grades: [
      { subject: "English", grade: "A", percentage: 93, status: "improved" },
      { subject: "Hindi", grade: "A-", percentage: 89, status: "improved" },
      {
        subject: "Mathematics",
        grade: "A",
        percentage: 94,
        status: "improved",
      },
      {
        subject: "Environmental Studies",
        grade: "B+",
        percentage: 87,
        status: "improved",
      },
      {
        subject: "Arts Education",
        grade: "A+",
        percentage: 97,
        status: "improved",
      },
      {
        subject: "Health and Physical Education",
        grade: "A",
        percentage: 92,
        status: "improved",
      },
    ],
  },
];

const currentSemester: Semester = {
  name: "Term 3",
  averagePercentage: 91,
  grades: [
    { subject: "English", grade: "A", percentage: 94, status: "improved" },
    { subject: "Hindi", grade: "A", percentage: 92, status: "improved" },
    { subject: "Mathematics", grade: "A", percentage: 95, status: "improved" },
    {
      subject: "Environmental Studies",
      grade: "A-",
      percentage: 90,
      status: "improved",
    },
    {
      subject: "Arts Education",
      grade: "A+",
      percentage: 98,
      status: "improved",
    },
    {
      subject: "Health and Physical Education",
      grade: "A",
      percentage: 93,
      status: "improved",
    },
  ],
};

export default function GradesPage() {
  const [selectedSemester, setSelectedSemester] = useState<Semester>(
    previousSemesters[0]
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Grades</h1>
      <Tabs defaultValue="current">
        <TabsList>
          <TabsTrigger value="current">Current Term</TabsTrigger>
          <TabsTrigger value="previous">Previous Terms</TabsTrigger>
        </TabsList>
        <TabsContent value="current">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="mr-2 h-4 w-4" />
                {currentSemester.name}
              </CardTitle>
              <CardDescription>
                Current Average: {currentSemester.averagePercentage}%
              </CardDescription>
            </CardHeader>
            <CardContent>
              <GradesTable semester={currentSemester} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="previous">
          <div className="grid gap-6 md:grid-cols-2">
            {previousSemesters.map((semester) => (
              <Card
                key={semester.name}
                className={cn(
                  "cursor-pointer transition-all duration-300",
                  selectedSemester.name === semester.name
                    ? "shadow-lg shadow-primary/30 scale-105 border-primary"
                    : "hover:shadow-md"
                )}
                onClick={() => setSelectedSemester(semester)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    {semester.name}
                  </CardTitle>
                  <CardDescription>
                    Average: {semester.averagePercentage}%
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Grades for {selectedSemester.name}</CardTitle>
              <CardDescription>
                Average: {selectedSemester.averagePercentage}%
              </CardDescription>
            </CardHeader>
            <CardContent>
              <GradesTable semester={selectedSemester} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function GradesTable({ semester }: { semester: Semester }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Subject</TableHead>
          <TableHead>Grade</TableHead>
          <TableHead>Percentage</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {semester.grades.map((grade) => (
          <TableRow key={grade.subject}>
            <TableCell className="font-medium">{grade.subject}</TableCell>
            <TableCell>{grade.grade}</TableCell>
            <TableCell>{grade.percentage}%</TableCell>
            <TableCell>
              {grade.status === "improved" && (
                <TrendingUp className="h-4 w-4 text-green-500" />
              )}
              {grade.status === "declined" && (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              {grade.status === "unchanged" && (
                <BarChart className="h-4 w-4 text-yellow-500" />
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
