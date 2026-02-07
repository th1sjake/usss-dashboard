# USSS Reporting System - Implementation Plan

## 1. Project Overview
A full-stack web application for USSS employees (Majestic RP) to submit reports and track rankings. 
- **Stack**: NestJS, React (Vite), PostgreSQL, Docker.
- **Key Feature**: Discord Webhook integration that updates a single leaderboard message.

## 2. Architecture & Infrastructure

### Directory Structure
```
/usss
  /server (NestJS)
  /client (React + Vite + Tailwind)
  docker-compose.yml
```

### Database Schema (Prisma)
- **User**
  - id (UUID)
  - staticId (String, unique) - #123456
  - nickname (String)
  - password (String, hashed)
  - role (Enum: ADMIN, EMPLOYEE)
  - rank (Int)
  - department (String?)
  - reports (Relation)
  
- **Report**
  - id (UUID)
  - typeId (UUID) -> Relation to TaskType
  - proofUrl (String)
  - date (DateTime)
  - points (Int) - Snapshot of points at time of submission
  - status (Enum: PENDING, APPROVED, REJECTED) - Optional if strict auto-approval isn't requested, but good for validity.
  
- **TaskType**
  - id (UUID)
  - name (String)
  - points (Int)
  - category (String)

- **SystemConfig**
  - key (String, ID)
  - value (String)
  - *Used to store Discord Message ID for editing*

### Containerization
- **Postgres**: Alpine image, persistent volume.
- **Server**: Node 18/20, builds dist.
- **Client**: Nginx or static file serving (for dev we might use node container).

## 3. Backend (NestJS)
**Modules**:
- `AuthModule`: JWT strategy, Login/Register.
- `UsersModule`: Management of employee data.
- `ReportsModule`: Submission logic, point calculation.
- `TasksModule`: Configuration of work types and point values.
- `DiscordModule`: 
  - Service to format data into an Embed.
  - Logic to check if a message exists (via stored ID).
  - Webhook client to Send (first time) or Edit (subsequent times).

## 4. Frontend (React + Vite)
**UI Library**: Shadcn/UI (based on Radix & Tailwind) for a premium, clean aesthetic.

**Pages**:
- `/login`: Auth screen.
- `/`: Dashboard (redirects based on role).
- `/submit`: Report submission form.
- `/admin/users`: User management table.
- `/admin/reports`: Report log & stats.
- `/admin/settings`: Task types & point configuration.

## 5. Implementation Steps
1. **Setup**: Initialize Client, Configure Docker Compose.
2. **Backend Core**: Database connection (Prisma), Auth logic.
3. **Backend Features**: CRUD for Users, Tasks, Reports.
4. **Discord Integration**: Implement the "Single Message" update logic.
5. **Frontend Core**: Setup Tailwind, Router, Auth Context.
6. **Frontend UI**: Build responsive forms and admin tables.
7. **Polish**: Animations, error handling, final aesthetic tweaks.

## 6. Guidelines
- Use strictly typed DTOs.
- Environment variables for secrets (DB URL, Webhook URL).
- Dark mode default design (fits GTA RP/Discord vibe).
