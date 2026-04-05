# Finance Dashboard UI

Frontend-only finance dashboard built for assignment evaluation.

## Stack

- React + TypeScript + Vite
- CSS Modules
- Recharts for visualizations
- Mock API service (in-memory + simulated delay)

## Setup

1. Install dependencies:

```bash
npm install
```

2. Start dev server:

```bash
npm run dev
```

3. Build production bundle:

```bash
npm run build
```

## Feature Overview

### 1) Dashboard Overview

- Summary cards for Total Balance, Income, and Expenses
- Time-based visualization: balance trend chart
- Categorical visualization: expense category breakdown chart

### 2) Transactions Section

- Table fields: Date, Description, Category, Type, Amount
- Filtering by type and category
- Search by description/category
- Sorting by date and amount
- Empty and no-match states

### 3) Basic Role-Based UI (simulated)

- Role selector in header: Viewer/Admin
- Viewer: read-only access
- Admin: can add and edit transactions via modal form

### 4) Insights Section

- Highest spending category
- Month-over-month comparison summary
- Basic outlier/observation insight

### 5) State Management

- Centralized Context + reducer state for:
  - transactions
  - filters
  - selected role
  - theme
  - loading/error states
- Derived selectors for summaries, charts, and insights

### 6) UI/UX

- Responsive layout for desktop/tablet/mobile
- Graceful loading/error/empty states
- Clean, readable structure and interactions

## Optional Enhancements Implemented

- Dark mode toggle (persisted in local storage)
- Mock API integration with delayed responses
- Export currently filtered transactions to CSV and JSON
- Lazy-loaded dashboard modules and split vendor chunks for better load behavior

## Project Structure

```text
src/
  data/                # seed transactions
  features/
    dashboard/         # cards + charts
    insights/          # insight cards
    transactions/      # table, filters, modal
  services/            # mock API
  state/               # Context + reducer
  types/               # shared TS types
  utils/               # finance calculations + exporters
```

## Assumptions

- This is an evaluation-focused frontend assignment, not production RBAC/auth.
- Mock API is in-memory and resets on full page refresh.
- Currency display is USD for demonstration.

## Deployment (Vercel)

This project is Vercel-ready with a [vercel.json](vercel.json) config for Vite + SPA rewrites.

1. Install Vercel CLI (optional):

```bash
npm i -g vercel
```

2. Deploy from project root:

```bash
vercel
```

3. For production deploy:

```bash
vercel --prod
```

If deploying via Vercel dashboard, import the repository and keep default Vite build settings.
