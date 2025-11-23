# Aurelia Project Documentation for AI Agents

## Project Overview
Aurelia is a comprehensive health and wellness application designed to provide personalized health insights, analysis, and actionable recommendations. It leverages advanced AI models to analyze user data and generate tailored health plans.

### Core Technologies
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **AI/ML:** 
  - Mistral AI (Analysis & Recommendations)
  - Pixtral (Biomarker/Vision capabilities)
- **Language:** TypeScript

## Agent Guidelines & Best Practices

### 1. Documentation Maintenance
- **Update Regularly:** As an AI agent working on this codebase, you are responsible for keeping this `AGENTS.md` file up to date. If you implement significant architectural changes, add new modules, or change core logic, reflect those changes here.
- **Context Awareness:** Before making changes, always review the project structure and existing documentation to ensure consistency.

### 2. Coding Standards
- **Type Safety:** Strictly adhere to TypeScript best practices. Avoid `any` types; define interfaces and types in `types/index.ts` or relevant component files.
- **Component Structure:** Use functional components. Keep components small and focused. Place reusable UI components in `components/ui`.
- **Styling:** Use Tailwind CSS utility classes. Avoid inline styles. Ensure responsiveness and dark mode compatibility (using `dark:` classes or CSS variables).
- **State Management:** Use React hooks (`useState`, `useEffect`, `useContext`) appropriately. For complex server state, rely on Next.js data fetching patterns.

### 3. Architecture & Patterns
- **Server Actions/API Routes:** Use Next.js API routes (`app/api/...`) for backend logic and AI integrations.
- **AI Integration:** 
  - Use the dedicated clients in `lib/` (e.g., `lib/mistral/client.ts`) for AI interactions.
  - Handle AI responses gracefully, including error states and loading indicators.
- **Security:** Never hardcode API keys. Use environment variables (`process.env`). Ensure sensitive user data is handled securely.

### 4. Workflow
- **Testing:** Verify changes locally. Ensure the build process (`npm run build`) succeeds.
- **Clean Code:** Remove unused imports and console logs before finalizing tasks.
- **Comments:** Comment complex logic, especially in AI prompt generation or data parsing utilities.

## Current Project Status
- **Phase:** Active Development
- **Recent Focus:** Migration to Mistral AI, UI Internationalization (English), and Accessibility/Contrast improvements.
