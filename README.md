# Contact & Task Manager

A modern contact and task management application built with Next.js and Supabase, focused on clean architecture, predictable data access, and long-term maintainability.

🔗 **Live Site**  
https://aro-contact-task-manager.vercel.app/

---

## Demo Access

A demo account is available for evaluation without registration.

**Email:** demo@miko-aro.com  
**Password:** Demo1234

**Signup Page:** https://aro-contact-task-manager.vercel.app/signup

---

## Core Features

### Task Management

- Create, update, and delete tasks
- Separate tables for open and completed tasks
- Server-side pagination

### People Management

- Full CRUD for People
- Assign people to businesses
- Assign people with tags
- Pagination-ready data access patterns

### Business Management

- Create and manage businesses
- Assign tags and categories
- Associate businesses with people
- Reusable create and edit dialogs for consistent UX

### Tags & Categories

- Centralized management of tags and categories
- Reusable across people, and businesses
- Designed for future extensibility

### Authentication

- Secure authentication powered by Supabase Auth
- Middleware-protected routes
- Demo account support for evaluation

### UI & UX

- Component system based on shadcn/ui
- Accessible dialogs and forms
- Responsive layout optimized for desktop workflows

---

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Database:** PostgreSQL via Supabase
- **Authentication:** Supabase Auth (JWT-based)
- **Styling:** Tailwind CSS v4
- **UI Components:** shadcn/ui
- **Data & State:** Server Actions with server-side Supabase queries
- **Deployment:** Vercel

---

## Architecture Overview

The application is structured around a clear separation of concerns:

- App Router-first design using server components by default
- Read queries isolated in `lib/queries`
- Write operations isolated in `lib/actions`
- Client components limited to interactivity and presentation
- Page files focused on orchestration rather than business logic
- Reusable dialog-based forms for create and edit flows
- Pagination-ready queries across all core features

This structure keeps the codebase predictable, testable, and easy to extend as the feature set grows.

---

## Architecture & Security Notes

- Data fetching and mutations are handled on the server using Next.js Server Actions
- Supabase Row-Level Security (RLS) policies are explicitly defined at the database level
- Route-level loading states and error boundaries are implemented to improve resilience

## Validation & Testing Strategy

The application includes focused unit tests covering critical validation paths using Vitest.

- Input validation is centralized using schema-based validation
- Tests focus on high-impact flows such as create, update, assign, and delete operations
- Validation schemas are tested independently from UI and data access layers
