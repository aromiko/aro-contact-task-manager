# Contact & Task Manager

A modern contact and task management application built with Next.js 15, Supabase, and Tailwind CSS.  
Designed with clean architecture, scalable data patterns, and a responsive user experience in mind.

🔗 **Live Site:**  
https://aro-contact-task-manager.vercel.app/

---

## Demo Access

You can explore the app using the demo account below if you prefer not to sign up.

**Email:** demo@miko-aro.com  
**Password:** Demo1234

---

## Features

### Task Management

- Create, update, and delete tasks
- Separate views for open and completed tasks
- Server-side pagination
- Tag-based organization
- Clean table UI using shadcn components

### People Management

- Full CRUD for contacts
- Assign contacts to businesses
- Tag people for flexible grouping
- Scalable pagination-ready architecture

### Business Management

- Create and manage businesses
- Assign tags and categories
- Link businesses to people
- Clean edit and create flows with reusable dialogs

### Tags & Categories

- Centralized tag and category management
- Reusable across tasks, people, and businesses
- Designed for future expansion

### Authentication

- Secure authentication powered by Supabase
- Protected routes
- Demo account support

### UI & UX

- shadcn/ui components
- Accessible dialogs and sheets

---

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Database:** PostgreSQL (via Supabase)
- **Authentication:** JWT-based authentication via Supabase Auth
- **UI Components:** shadcn/ui
- **Styling:** Tailwind CSS v4
- **State & Data:** Server Actions + Supabase queries
- **Deployment:** Vercel

---

## Architecture Highlights

- App Router-first design
- Server Actions isolated in `lib/actions`
- Read queries isolated in `lib/queries`
- Clean page orchestration
- Reusable form dialogs for create and edit flows
- Pagination-ready queries across features
- No client-side data fetching for core CRUD operations

This architecture keeps the codebase predictable, testable, and easy to extend.
