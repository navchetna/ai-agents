import { useState } from "react";
import { Box, Typography, Card, CardContent } from "@mui/material";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import PdfViewerModal from "@/components/pdf-viewer-modal";
import { useTextbook } from "@/contexts/TextbookContext";

type Subject = {
  name: string;
  translation: string;
  courses: Course[];
  books: Book[];
  notes: Note[];
};

type Course = {
  id: string;
  name: string;
  instructor: string;
  description: string;
};

type Book = {
  id: string;
  title: string;
  author: string;
  coverImage: string;
  type: "textbook" | "book";
  grade?: number;
  url?: string;
};

type Note = {
  id: string;
  title: string;
  uploadDate: string;
  fileUrl: string;
};

const subjects: Subject[] = [
  {
    name: "English",
    translation: "English",
    courses: [
      {
        id: "e1",
        name: "English Grammar",
        instructor: "Ms. Sharma",
        description: "Basic English grammar and vocabulary",
      },
      {
        id: "e2",
        name: "English Literature",
        instructor: "Mr. Patel",
        description: "Reading and understanding short stories",
      },
    ],
    books: [
      {
        id: "et1",
        title: "NCERT English - Class 5 (Rip Van Winkle)",
        author: "NCERT",
        coverImage: "/placeholder.svg?height=200&width=150",
        type: "textbook",
        grade: 5,
        url: "/pdfs/rip-van-winkle.txt",
      },
      {
        id: "eb1",
        title: "Marigold Book V",
        author: "NCERT",
        coverImage: "/placeholder.svg?height=150&width=100",
        type: "book",
      },
    ],
    notes: [
      {
        id: "en1",
        title: "Grammar Notes",
        uploadDate: "2024-02-11",
        fileUrl: "#",
      },
    ],
  },
  {
    name: "Hindi",
    translation: "हिन्दी",
    courses: [
      {
        id: "h1",
        name: "Hindi Vyakaran",
        instructor: "Mrs. Gupta",
        description: "Hindi grammar and sentence structure",
      },
      {
        id: "h2",
        name: "Hindi Sahitya",
        instructor: "Mr. Singh",
        description: "Reading Hindi poems and short stories",
      },
    ],
    books: [
      {
        id: "ht1",
        title: "NCERT Hindi - Class 5",
        author: "NCERT",
        coverImage: "/placeholder.svg?height=200&width=150",
        type: "textbook",
        grade: 5,
        url: "https://ncert.nic.in/textbook/pdf/heem101.zip",
      },
      {
        id: "hb1",
        title: "Rimjhim",
        author: "NCERT",
        coverImage: "/placeholder.svg?height=150&width=100",
        type: "book",
      },
    ],
    notes: [
      {
        id: "hn1",
        title: "Vyakaran Notes",
        uploadDate: "2024-02-11",
        fileUrl: "#",
      },
    ],
  },
  {
    name: "Urdu",
    translation: "اردو",
    courses: [
      {
        id: "u1",
        name: "Urdu Grammar",
        instructor: "Mr. Ahmed",
        description: "Basic Urdu grammar and writing",
      },
      {
        id: "u2",
        name: "Urdu Literature",
        instructor: "Mrs. Khan",
        description: "Classical Urdu poetry and prose",
      },
    ],
    books: [
      {
        id: "ut1",
        title: "NCERT Urdu - Class 5",
        author: "NCERT",
        coverImage: "/placeholder.svg?height=200&width=150",
        type: "textbook",
        grade: 5,
        url: "https://ncert.nic.in/textbook/pdf/uehm101.zip",
      },
      {
        id: "ub1",
        title: "Urdu Reader",
        author: "NCERT",
        coverImage: "/placeholder.svg?height=150&width=100",
        type: "book",
      },
    ],
    notes: [
      {
        id: "un1",
        title: "Urdu Script Practice",
        uploadDate: "2024-02-11",
        fileUrl: "#",
      },
    ],
  },
  {
    name: "Telugu",
    translation: "తెలుగు",
    courses: [
      {
        id: "t1",
        name: "Telugu Grammar",
        instructor: "Mrs. Reddy",
        description: "Telugu grammar and sentence formation",
      },
      {
        id: "t2",
        name: "Telugu Literature",
        instructor: "Mr. Rao",
        description: "Telugu poetry and stories",
      },
    ],
    books: [
      {
        id: "tt1",
        title: "NCERT Telugu - Class 5",
        author: "NCERT",
        coverImage: "/placeholder.svg?height=200&width=150",
        type: "textbook",
        grade: 5,
        url: "https://ncert.nic.in/textbook/pdf/tehm101.zip",
      },
      {
        id: "tb1",
        title: "Telugu Reader",
        author: "NCERT",
        coverImage: "/placeholder.svg?height=150&width=100",
        type: "book",
      },
    ],
    notes: [
      {
        id: "tn1",
        title: "Telugu Script Notes",
        uploadDate: "2024-02-11",
        fileUrl: "#",
      },
    ],
  },
  {
    name: "Kannada",
    translation: "ಕನ್ನಡ",
    courses: [
      {
        id: "k1",
        name: "Kannada Grammar",
        instructor: "Mr. Kumar",
        description: "Kannada grammar and writing",
      },
      {
        id: "k2",
        name: "Kannada Literature",
        instructor: "Mrs. Gowda",
        description: "Kannada classical literature",
      },
    ],
    books: [
      {
        id: "kt1",
        title: "NCERT Kannada - Class 5",
        author: "NCERT",
        coverImage: "/placeholder.svg?height=200&width=150",
        type: "textbook",
        grade: 5,
        url: "https://ncert.nic.in/textbook/pdf/kaem101.zip",
      },
      {
        id: "kb1",
        title: "Kannada Reader",
        author: "NCERT",
        coverImage: "/placeholder.svg?height=150&width=100",
        type: "book",
      },
    ],
    notes: [
      {
        id: "kn1",
        title: "Kannada Script Practice",
        uploadDate: "2024-02-11",
        fileUrl: "#",
      },
    ],
  },
  {
    name: "Tamil",
    translation: "தமிழ்",
    courses: [
      {
        id: "tm1",
        name: "Tamil Grammar",
        instructor: "Mr. Murugan",
        description: "Tamil grammar and composition",
      },
      {
        id: "tm2",
        name: "Tamil Literature",
        instructor: "Mrs. Lakshmi",
        description: "Classical Tamil literature",
      },
    ],
    books: [
      {
        id: "tmt1",
        title: "NCERT Tamil - Class 5",
        author: "NCERT",
        coverImage: "/placeholder.svg?height=200&width=150",
        type: "textbook",
        grade: 5,
        url: "https://ncert.nic.in/textbook/pdf/taem101.zip",
      },
      {
        id: "tmb1",
        title: "Tamil Reader",
        author: "NCERT",
        coverImage: "/placeholder.svg?height=150&width=100",
        type: "book",
      },
    ],
    notes: [
      {
        id: "tmn1",
        title: "Tamil Script Notes",
        uploadDate: "2024-02-11",
        fileUrl: "#",
      },
    ],
  },
  {
    name: "Malayalam",
    translation: "മലയാളം",
    courses: [
      {
        id: "ml1",
        name: "Malayalam Grammar",
        instructor: "Mr. Menon",
        description: "Malayalam grammar and writing",
      },
      {
        id: "ml2",
        name: "Malayalam Literature",
        instructor: "Mrs. Nair",
        description: "Malayalam poetry and prose",
      },
    ],
    books: [
      {
        id: "mlt1",
        title: "NCERT Malayalam - Class 5",
        author: "NCERT",
        coverImage: "/placeholder.svg?height=200&width=150",
        type: "textbook",
        grade: 5,
        url: "https://ncert.nic.in/textbook/pdf/maem101.zip",
      },
      {
        id: "mlb1",
        title: "Malayalam Reader",
        author: "NCERT",
        coverImage: "/placeholder.svg?height=150&width=100",
        type: "book",
      },
    ],
    notes: [
      {
        id: "mln1",
        title: "Malayalam Script Practice",
        uploadDate: "2024-02-11",
        fileUrl: "#",
      },
    ],
  },
  {
    name: "Environmental Studies",
    translation: "Environmental Studies",
    courses: [
      {
        id: "es1",
        name: "Our Environment",
        instructor: "Mrs. Desai",
        description: "Learning about plants, animals, and our surroundings",
      },
      {
        id: "es2",
        name: "Our Society",
        instructor: "Mr. Joshi",
        description: "Understanding family, neighborhood, and community",
      },
    ],
    books: [
      {
        id: "est1",
        title: "NCERT Environmental Studies - Class 5",
        author: "NCERT",
        coverImage: "/placeholder.svg?height=200&width=150",
        type: "textbook",
        grade: 5,
        url: "https://ncert.nic.in/textbook/pdf/evem101.zip",
      },
      {
        id: "esb1",
        title: "Looking Around",
        author: "NCERT",
        coverImage: "/placeholder.svg?height=150&width=100",
        type: "book",
      },
    ],
    notes: [
      {
        id: "esn1",
        title: "Ecosystem Notes",
        uploadDate: "2024-02-11",
        fileUrl: "#",
      },
    ],
  },
  {
    name: "Mathematics",
    translation: "Mathematics",
    courses: [
      {
        id: "m1",
        name: "Arithmetic",
        instructor: "Mr. Kumar",
        description: "Basic operations and problem-solving",
      },
      {
        id: "m2",
        name: "Geometry",
        instructor: "Ms. Reddy",
        description: "Introduction to shapes and measurements",
      },
    ],
    books: [
      {
        id: "mt1",
        title: "NCERT Mathematics - Class 5",
        author: "NCERT",
        coverImage: "/placeholder.svg?height=200&width=150",
        type: "textbook",
        grade: 5,
        url: "https://ncert.nic.in/textbook/pdf/maem101.zip",
      },
      {
        id: "mb1",
        title: "Math Magic",
        author: "NCERT",
        coverImage: "/placeholder.svg?height=150&width=100",
        type: "book",
      },
    ],
    notes: [
      {
        id: "mn1",
        title: "Arithmetic Notes",
        uploadDate: "2024-02-11",
        fileUrl: "#",
      },
    ],
  },
];

export default function CoursesPage() {
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([
    "English",
  ]);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState({ url: "", title: "" });
  const { setIsTextbookOpen } = useTextbook();

  const handleOpenPdf = (url: string | undefined, title: string) => {
    if (url) {
      setSelectedPdf({ url, title });
      setIsPdfModalOpen(true);
      setIsTextbookOpen(true);
    } else {
      console.error(`No PDF URL available for book: ${title}`);
      // Optionally, you can show an error message to the user here
    }
  };

  const handleClosePdf = () => {
    setIsPdfModalOpen(false);
    setIsTextbookOpen(false);
  };

  const toggleSubject = (subject: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(subject)
        ? prev.filter((s) => s !== subject)
        : [...prev, subject]
    );
  };

  return (
    <Box sx={{ maxWidth: 1200, margin: "auto", py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Courses and Books
      </Typography>

      {/* Subject Selection */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Select Your Subjects
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {subjects.map((subject) => (
              <Button
                key={subject.name}
                variant={
                  selectedSubjects.includes(subject.name)
                    ? "default"
                    : "outline"
                }
                onClick={() => toggleSubject(subject.name)}
              >
                {subject.name}
              </Button>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Subject Content */}
      {selectedSubjects.map((selectedSubject) => {
        const subject = subjects.find((s) => s.name === selectedSubject);
        if (!subject) return null;

        return (
          <Card key={subject.name} sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                {subject.name}
                {subject.name !== subject.translation && (
                  <Typography
                    component="span"
                    variant="body2"
                    sx={{ ml: 2, color: "text.secondary" }}
                  >
                    {subject.translation}
                  </Typography>
                )}
              </Typography>

              <Tabs defaultValue="courses">
                <TabsList>
                  <TabsTrigger value="courses">Courses</TabsTrigger>
                  <TabsTrigger value="books">Books</TabsTrigger>
                  <TabsTrigger value="notes">Notes</TabsTrigger>
                </TabsList>

                <TabsContent value="courses">
                  <Box
                    sx={{
                      display: "grid",
                      gap: 2,
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(300px, 1fr))",
                    }}
                  >
                    {subject.courses.map((course) => (
                      <Card key={course.id}>
                        <CardContent>
                          <Typography variant="h6">{course.name}</Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            gutterBottom
                          >
                            Instructor: {course.instructor}
                          </Typography>
                          <Typography variant="body2">
                            {course.description}
                          </Typography>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                </TabsContent>

                <TabsContent value="books">
                  <Box
                    sx={{
                      display: "grid",
                      gap: 2,
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(300px, 1fr))",
                    }}
                  >
                    {subject.books.map((book) => (
                      <Card key={book.id}>
                        <CardContent sx={{ display: "flex", gap: 2 }}>
                          <Image
                            src={book.coverImage || "/vercel.svg"}
                            alt={book.title}
                            width={100}
                            height={150}
                            style={{ objectFit: "cover" }}
                          />
                          <Box>
                            <Typography variant="h6">{book.title}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {book.author}
                            </Typography>
                            {book.type === "textbook" && (
                              <>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  Grade {book.grade}
                                </Typography>
                                <Button
                                  variant="link"
                                  onClick={() =>
                                    handleOpenPdf(book.url, book.title)
                                  }
                                >
                                  View Textbook
                                </Button>
                              </>
                            )}
                          </Box>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                </TabsContent>

                <TabsContent value="notes">
                  <Box sx={{ display: "grid", gap: 2 }}>
                    {subject.notes.map((note) => (
                      <Card key={note.id}>
                        <CardContent
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Box>
                            <Typography variant="h6">{note.title}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              Uploaded on: {note.uploadDate}
                            </Typography>
                          </Box>
                          <Button
                            variant="outline"
                            // src={note.fileUrl}
                            // download
                          >
                            Download
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        );
      })}
      <PdfViewerModal
        isOpen={isPdfModalOpen}
        onClose={handleClosePdf}
        pdfUrl={selectedPdf.url}
        bookTitle={selectedPdf.title}
      />
    </Box>
  );
}
