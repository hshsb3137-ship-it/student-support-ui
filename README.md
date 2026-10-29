# Grievance Resolve

Build the frontend foundation for a final-year project called:

"Agentic AI-Based Intelligent Student Grievance Resolution System Using NLP and Generative AI"

Use:

- React

- TypeScript

- Tailwind CSS

- Responsive web design

IMPORTANT:

This is FRONTEND ONLY for now.

Do not implement Supabase, database, AI, RAG, LangGraph, or external APIs yet.

Use mock data where necessary.

Create a professional university grievance management web application.

USER ROLES

1. Student

2. Department Staff

3. Admin

Create a role-based application structure so each role has its own dashboard and navigation.

--------------------------------------------------

AUTHENTICATION UI

--------------------------------------------------

Create:

- Login page

- Role selection: Student / Department Staff / Admin

- Email field

- Password field

- Login button

- Forgot password UI

- University logo placeholder

For now, login can use mock authentication.

After login:

- Student → Student Dashboard

- Department Staff → Department Dashboard

- Admin → Admin Dashboard

--------------------------------------------------

GLOBAL UI

--------------------------------------------------

Create:

- Responsive sidebar

- Top navigation bar

- User profile section

- Notifications icon

- Logout option

- Breadcrumbs where useful

Use a clean professional university-management-system design.

Create reusable components:

- DashboardCard

- StatusBadge

- PriorityBadge

- DataTable

- Modal

- Notification

- EmptyState

- LoadingState

- ConfirmationDialog

--------------------------------------------------

STUDENT DASHBOARD

--------------------------------------------------

Create dashboard cards:

- Total Grievances

- Pending

- In Progress

- Resolved

- Escalated

Create a Recent Grievances section.

Student sidebar:

- Dashboard

- Submit Grievance

- My Grievances

- Track Grievance

- Notifications

- AI Assistant

- Profile

--------------------------------------------------

DEPARTMENT STAFF DASHBOARD

--------------------------------------------------

Create dashboard cards:

- Total Assigned

- New

- Under Review

- High Priority

- Resolved

- Escalated

Department sidebar:

- Dashboard

- Assigned Grievances

- Pending Actions

- Escalated Cases

- Reports

- Notifications

- Profile

--------------------------------------------------

ADMIN DASHBOARD

--------------------------------------------------

Create dashboard cards:

- Total Grievances

- Pending

- In Progress

- Resolved

- Escalated

- High Priority

Admin sidebar:

- Dashboard

- All Grievances

- Departments

- Students

- Staff

- Escalations

- Analytics

- Reports

- Notifications

- Settings

--------------------------------------------------

MOCK DATA

--------------------------------------------------

Create realistic mock data for:

Students:

- Student ID

- Name

- Email

- Department

Departments:

- Academic

- Examination

- Finance/Fees

- Scholarship

- Hostel

- Library

- Transport

- Infrastructure

- IT

Grievances:

- Grievance ID

- Title

- Description

- Category

- Department

- Priority

- Status

- Submission Date

- Last Updated

Statuses:

- Submitted

- Under Review

- In Progress

- Resolution Proposed

- Resolved

- Rejected

- Escalated

Priorities:

- Low

- Medium

- High

- Critical

--------------------------------------------------

IMPORTANT

--------------------------------------------------

Keep the code modular and clean.

Create separate routes/pages for:

- /login

- /student

- /department

- /admin

Make the application visually polished but do not overcomplicate it.

The frontend should later be ready to connect to:

React

→ Supabase

→ AI services

→ RAG

→ Agentic AI

Do not implement those integrations now.

First build and verify the complete frontend foundation.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://student-support-ui.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/4f66a447-719d-4a72-933d-cea07fb7c406).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
