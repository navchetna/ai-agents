# StudyBuddy | School Student Companion

## Overview
StudyBuddy is a comprehensive digital platform designed to assist students in managing their academic life efficiently. It includes features such as a dashboard, schedule management, course materials, grade tracking, study timers, an AI coach, and much more. The application is built with a responsive UI and supports dark mode for better usability.

## Features

### 1. Dashboard
**Location:** `app/page.tsx`
- Overview of key metrics: Courses, Assignments Due, and Overall Grade
- Today's Schedule
- Upcoming Assignments
- Quick access to main features through metric cards

### 2. Schedule
**Location:** `app/schedule/page.tsx`
- Integrated Calendar view
- Today's Events
- Sports Events
- Google and Outlook calendar integration options

### 3. Courses
**Location:** `app/courses/page.tsx`
- List of enrolled courses
- Course materials (textbooks, notes)
- Ability to view PDF textbooks
- Multi-language support (English, Hindi, Urdu, Telugu, Kannada, Tamil, Malayalam)

### 4. Assignments
**Location:** `app/assignments/page.tsx`
- List of assignments categorized by status (Not Started, Pending, In Progress, Completed)
- Assignment details including due date, priority, and course
- Ability to add new assignments
- Status update functionality

### 5. Grades
**Location:** `app/grades/page.tsx`
- Current term grades
- Previous term grades
- Visual indicators for grade improvements or declines
- Overall grade average

### 6. Study Timer
**Location:** `app/study-timer/page.tsx`
- Pomodoro technique timer
- Customizable study and break durations
- Focus tracking
- Session history

### 7. AI Coach
**Location:** `app/ai-coach/page.tsx`
- AI-powered doubt solving
- Note generation feature
- Image upload for visual problem-solving
- Chat interface for interacting with AI

### 8. Resource Library
**Location:** `app/resource-library/page.tsx`
- Categorized educational resources (past papers, notes, videos)
- Search and filter functionality
- Grade and subject-specific resources

### 9. Support
**Location:** `app/support/page.tsx`
- FAQ section
- Contact form
- Live chat (placeholder for future implementation)
- Community forums and resources
- Bug reporting system

### 10. Settings
**Location:** `app/settings/page.tsx`
- Profile settings
- App preferences (dark mode, font size, language)
- Study preferences (Pomodoro timer settings)
- Privacy and data management

### 11. Scheduled Theme
**Location:** `app/settings/scheduled-theme/page.tsx`
- Automatic theme switching based on time
- Custom schedule or sunset-to-sunrise option

### 12. Authentication
**Location:** `app/login/page.tsx` and `app/signup/page.tsx`
- User login functionality
- New user registration
- Password management (implied, not fully implemented)

### 13. PDF Viewer
**Location:** `components/pdf-viewer.tsx` and `components/pdf-viewer-modal.tsx`
- Integrated PDF viewer for textbooks and resources
- Highlighting and note-taking features
- AI-powered chat for asking questions about the content

### 14. Metrics Card
**Location:** `components/metrics-card.tsx`
- Reusable component for displaying key metrics
- Used on the dashboard for quick information display

### 15. Schedule Components
**Location:** `components/schedule.tsx`, `components/sports-events.tsx`, `components/todays-events.tsx`
- Display of daily schedule
- Sports events listing
- Today's events overview

### 16. Assignments Table
**Location:** `components/assignments-table.tsx`
- Reusable component for displaying assignments
- Used in both dashboard and assignments page

### 17. Integrated Calendar
**Location:** `components/integrated-calendar.tsx`
- Full calendar view with events
- Filtering and search capabilities

### 18. Theme Management
**Location:** `contexts/ThemeContext.tsx`
- Dark mode toggle
- Scheduled theme changes

### 19. Timer Management
**Location:** `contexts/TimerSettingsContext.tsx`, `contexts/TimerContext.tsx`
- Pomodoro timer settings
- Timer state management

### 20. Textbook Context
**Location:** `contexts/TextbookContext.tsx`
- Management of textbook viewing state

### 21. Global Styling
**Location:** `styles/globals.css`
- Application-wide styles and theme variables



## Conclusion
The Student Companion Application is designed to be a comprehensive tool for students, combining organizational features with AI-powered learning assistance. It aims to improve study efficiency, track academic progress, and provide easy access to resources, all within a user-friendly interface.



