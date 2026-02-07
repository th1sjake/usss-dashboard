
# USSS Reporting - Frontend Implementation Plan

## Overview
A modern, responsive React application using Vite and Shadcn/UI (Tailwind CSS) for managing USSS employee reports.

## Page Structure

### 1. **Login Page (`/login`)**
- **Purpose**: Authenticate users.
- **Layout**: Clean, centered card.
- **Components**:
  - `LoginForm` (Input `staticId`, `password`, Submit Button).
  - Logo/Header.
- **State**: Local form state (`staticId`, `password`), global `auth` state (redirect on success).

### 2. **Dashboard (`/`)** - *Employee View*
- **Layout**: Header (User info, Logout), Main (Stats, Actions, History).
- **Core Components**:
  - `StatsCard`: Shows Points relevant to user (Today/Week/Total).
  - `ReportFormDialog`: Modal containing `ReportForm` to submit new report.
  - `ReportsTable`: List of user's own reports with status badges (Pending/Approved/Rejected).
- **State**:
  - `userReports`: Fetched list from `GET /reports/my`.
  - `taskTypes`: Fetched list for dropdown.

### 3. **Admin Dashboard (`/admin`)** - *Admin View*
- **Layout**: Sidebar/Tabs for navigation (Reports, Users, Tasks).
- **Sub-Pages/Tabs**:
  - **Reports Management**:
    - Filterable table (Date range, Status, User).
    - Actions: Approve/Reject (triggers Discord update).
  - **Employee Management**:
    - List of all users.
    - Actions: Change Rank (if implemented), promote to Admin, delete.
  - **Task Management**:
    - CRUD table for `TaskType` (Name, Points, Category).
    - Add New Task modal.

## Shared Components
- **`Layout`**: Wrapper for protected routes (Header, Container).
- **`DataTable`**: Reusable table component with sorting/pagination (using `@tanstack/react-table`).
- **`Badge`**: Status indicator (Green=Approved, Yellow=Pending, Red=Rejected).
- **`Dialog`**: Modal wrapper for forms.
- **`DatePicker`**: For filtering.

## State Management
- **Auth**: Context API (`AuthContext`) stores `user` object and `token`. Persisted in `localStorage`.
- **Data Fetching**: `React Query` (TanStack Query) recommended for caching, automatic refetching, and loading states.
- **Form Handling**: `React Hook Form` + `Zod` validation.

## API Integration (`lib/api.ts`)
- Configured Axios instance.
- Interceptors to inject `Authorization: Bearer token`.
- Global error handling (redirect to login on 401).

## Styling
- **Theme**: Dark mode by default (fits Majestic RP/GTA aesthetic).
- **Colors**: Slate/Zinc palette with blue accents.
- **Library**: `lucide-react` for icons.

