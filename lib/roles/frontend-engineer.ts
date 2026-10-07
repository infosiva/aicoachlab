import type { Role } from './types'

export const FRONTEND_ENGINEER: Role = {
  slug: 'frontend-engineer',
  title: 'Frontend Engineer',
  blurb: 'Builds the part of a product people see and touch, so it loads fast, works for everyone and stays easy to change.',
  asOf: '2026-10',
  demand: [],
  scenario: {
    title: 'Self-serve billing dashboard for a SaaS product',
    story:
      'Customers currently email support to change plans or download invoices. You build a billing dashboard inside the web app where they can see usage, switch plans and get invoices. It has to load quickly on a phone and work with a keyboard and screen reader.',
  },
  steps: [
    { stackId: 'ui', label: 'Build the UI', happens: 'Break the design into typed components: plan cards, usage chart, invoice table and a confirm dialog.' },
    { stackId: 'framework', label: 'Routing and rendering', happens: 'Pick which pages render on the server and which parts need client interactivity.' },
    { stackId: 'data', label: 'Fetch data', happens: 'Load plans and invoices from the API, cache them, and update the screen after a plan change.' },
    { stackId: 'styling', label: 'Style', happens: 'Apply design tokens and responsive layouts so the dashboard works from phone to desktop.' },
    { stackId: 'a11y', label: 'Make it accessible', happens: 'Check focus order, labels and contrast, and test the plan-change flow with keyboard only.' },
    { stackId: 'perf-test', label: 'Test and measure', happens: 'Write component and end-to-end tests, then check load speed and bundle size before release.' },
  ],
  stack: [
    {
      id: 'ui', name: 'TypeScript and React components',
      what: 'A typed language and a component library for building screens out of small, reusable pieces.',
      why: 'Typed components catch wrong props at build time, and a dashboard has many repeated pieces such as cards and rows.',
      mustKnow: ['Keep components small and driven by props', 'Know how state, effects and re-renders interact', 'Type API responses instead of using any'],
      mistake: 'Putting everything in one giant component with a dozen pieces of state.',
    },
    {
      id: 'framework', name: 'Web framework (Next.js or similar)',
      what: 'A framework that adds routing, server rendering and build tooling on top of React.',
      why: 'Server rendering gets the first screen to the user fast, and the framework handles routing and code splitting.',
      mustKnow: ['Difference between server and client components', 'How routes, layouts and loading states map to files', 'Read the framework docs for the exact version you use'],
      mistake: 'Marking every component as client-side and losing the benefit of server rendering.',
    },
    {
      id: 'data', name: 'Data fetching and state',
      what: 'How the browser gets server data and keeps it in sync, using fetch with a cache library such as TanStack Query or framework built-ins.',
      why: 'Plans and invoices change on the server, so the screen needs caching, loading states and refresh after an update.',
      mustKnow: ['Handle loading, error and empty states for every request', 'Invalidate cached data after a mutation', 'Keep server data separate from local UI state'],
      mistake: 'Copying server data into local state and then showing stale values after an update.',
    },
    {
      id: 'styling', name: 'CSS, Tailwind and design tokens',
      what: 'The styling layer: modern CSS, a utility library such as Tailwind, and shared tokens for colour, spacing and type.',
      why: 'Tokens keep the dashboard consistent with the rest of the product and make theme changes cheap.',
      mustKnow: ['Mobile-first layouts with flexbox and grid', 'Use tokens instead of hard-coded colours', 'Support dark mode and reduced motion preferences'],
      mistake: 'Designing only at desktop width and fixing mobile at the end.',
    },
    {
      id: 'a11y', name: 'Accessibility (WCAG)',
      what: 'Making the interface usable with a keyboard, screen reader and low vision, following WCAG guidelines.',
      why: 'A billing screen blocks customers from paying if a button cannot be reached or announced.',
      mustKnow: ['Use real buttons, links and labels before ARIA', 'Visible focus and logical tab order', 'Contrast of at least 4.5 to 1 for body text'],
      mistake: 'Using a clickable div instead of a button and losing keyboard and screen reader support.',
    },
    {
      id: 'perf-test', name: 'Testing and performance',
      what: 'Component tests with Vitest and Testing Library, end-to-end tests with Playwright, and Core Web Vitals checks with Lighthouse.',
      why: 'Plan changes involve money, so the flow needs automated tests, and slow pages lose users.',
      mustKnow: ['Test behaviour a user sees, not implementation details', 'Cover the main flow end to end', 'Watch bundle size, image size and layout shift'],
      mistake: 'Adding a large library for one small feature and never checking the bundle size.',
    },
  ],
}
