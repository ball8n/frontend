# Test Analysis Dashboard (Next.js + shadcn/ui)

This is a modern implementation of the test analysis dashboard using Next.js and shadcn/ui components.

## Features

- **Modern UI Components** - Built with shadcn/ui components for a clean, consistent interface
- **Interactive Charts** - Responsive charts that adapt to any screen size
- **Type-Safe** - Full TypeScript support for robust code
- **Server Components** - Leveraging Next.js server components for efficient rendering
- **Dark Mode Support** - Seamless light/dark mode switching

## Setup Instructions

1. **Create Next.js Project**:

   ```bash
   npx create-next-app@latest my-dashboard --typescript --tailwind --eslint --app --src-dir
   cd my-dashboard
   ```

2. **Setup shadcn/ui**:

   ```bash
   npx shadcn-ui@latest init
   ```

   Follow the prompts to set up your project.

3. **Install Required Components**:

   ```bash
   npx shadcn-ui@latest add button card select tabs sheet switch
   ```

4. **Install Chart Dependencies**:

   ```bash
   npm install recharts
   ```

5. **Configure Environment Variables**:

   Create a `.env.local` file in the project root with the following:

   ```bash
   # Base API URL for all backend requests
   NEXT_PUBLIC_BALLOON_BASE_API_URL=http://localhost:4200
   
   # Firebase configuration (if used)
   # NEXT_PUBLIC_FIREBASE_API_KEY=...
   # NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
   # (other NEXT_PUBLIC_FIREBASE_* vars)
   ```

6. **Start the Development Server**:
   ```bash
   npm run dev
   ```

## Project Structure

- `src/app/page.tsx` - Main dashboard page
- `src/app/layout.tsx` - Root layout with providers
- `src/components/ui/` - shadcn UI components
- `src/components/dashboard/` - Custom dashboard components
- `src/lib/data.ts` - Data fetching and processing
- `src/styles/` - Global styles and theme configuration

## Implementation Notes

This dashboard replaces the original HTML/JavaScript/Plotly.js implementation with:

1. Next.js for the framework
2. shadcn/ui for UI components
3. Recharts for charting (compatible with shadcn/ui theme)
4. Tailwind CSS for styling
5. TypeScript for type safety

The visualization remains the same but with improved interactivity, performance, and visual design.
