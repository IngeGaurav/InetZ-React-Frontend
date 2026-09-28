# Ienerz — Complete Project Documentation

> **Purpose of this document:** Every file in this project is explained — what it does, why it exists, what problem it solves, and how it connects to other files. Read this before touching the codebase.

---

## Table of Contents

1. [Why This Architecture?](#1-why-this-architecture)
2. [Project Folder Map](#2-project-folder-map)
3. [Root Configuration Files](#3-root-configuration-files)
4. [Entry Points — main.jsx and App.jsx](#4-entry-points--mainjsx-and-appjsx)
5. [Styles — The CSS Architecture](#5-styles--the-css-architecture)
6. [Constants](#6-constants)
7. [Utilities](#7-utilities)
8. [API Layer](#8-api-layer)
9. [Redux — Global Client State](#9-redux--global-client-state)
10. [TanStack Query — Server State](#10-tanstack-query--server-state)
11. [Hooks](#11-hooks)
12. [Validations — Zod Schemas](#12-validations--zod-schemas)
13. [Services](#13-services)
14. [UI Components — Shadcn / Radix](#14-ui-components--shadcn--radix)
15. [Form Components](#15-form-components)
16. [Common Components](#16-common-components)
17. [Layouts](#17-layouts)
18. [Routes](#18-routes)
19. [Pages](#19-pages)
20. [Redux vs TanStack Query — The Golden Rule](#20-redux-vs-tanstack-query--the-golden-rule)
21. [Authentication Flow — End to End](#21-authentication-flow--end-to-end)
22. [How to Add a New Feature](#22-how-to-add-a-new-feature)
23. [Styling Guidelines — When to Use What](#23-styling-guidelines--when-to-use-what)
24. [Security Architecture](#24-security-architecture)
25. [Available Scripts](#25-available-scripts)

---

## 1. Why This Architecture?

### The Problem with Simple React Projects

Most React tutorials show you a flat `src/components/` folder with everything mixed together. That works for 5 components. It **breaks down completely** when you have:

- 30+ pages
- 50+ components
- A team of 5+ developers
- Features being added and removed over time

### What We Chose Instead: Feature-Based Architecture

Every meaningful piece of functionality lives in its own folder under `src/features/`. Each feature is **self-contained** — it has its own components, hooks, and service calls. This means:

- You can delete a feature by deleting one folder
- Two developers can work on different features without merge conflicts
- A new team member can read one feature folder and understand that entire slice of the app

### The Three-Layer State Model

One of the most important decisions in a React app is **where state lives**. We use three distinct layers:

```
┌─────────────────────────────────────────────────────────┐
│  LAYER 1: Local State — useState / useReducer           │
│  For: UI toggles, form inputs, temporary component state │
│  Example: dropdown open/closed, modal visibility         │
├─────────────────────────────────────────────────────────┤
│  LAYER 2: Redux Toolkit — Global Client State           │
│  For: Cross-component app state that has no server copy  │
│  Example: auth identity, theme, sidebar, preferences     │
├─────────────────────────────────────────────────────────┤
│  LAYER 3: TanStack Query — Server State                 │
│  For: Anything fetched from an API                       │
│  Example: user list, dashboard stats, any CRUD data      │
└─────────────────────────────────────────────────────────┘
```

Violating this model (e.g., putting API responses in Redux) is the #1 cause of bugs and performance issues in React apps. More on this in [Section 20](#20-redux-vs-tanstack-query--the-golden-rule).

---

## 2. Project Folder Map

```
D:\Ienerz React Setup\
│
├── .env.development          ← Dev environment variables (local only, git-ignored)
├── .env.example              ← Template that IS committed — shows required vars
├── .gitignore                ← Tells Git what not to track
├── .husky/                   ← Pre-commit hooks (runs ESLint + Prettier before commit)
├── .prettierrc               ← Code formatting rules
├── .prettierignore           ← Files Prettier should skip
├── components.json           ← Shadcn UI configuration
├── eslint.config.js          ← ESLint rules (flat config format)
├── index.html                ← The ONE HTML file — Vite injects JS here
├── package.json              ← Dependencies and npm scripts
├── README.md                 ← This file
├── vite.config.js            ← Build tool configuration
│
└── src/
    ├── main.jsx              ← App entry point (renders into index.html's #root)
    ├── App.jsx               ← Root component (wraps all providers)
    │
    ├── api/                  ← Everything HTTP-related
    │   ├── axios.js          ← Axios instance with interceptors
    │   ├── endpoints.js      ← All API endpoint URLs
    │   └── helpers.js        ← Thin wrappers (get, post, put, delete, upload)
    │
    ├── assets/               ← Images, fonts, SVGs (bundled by Vite)
    │
    ├── components/
    │   ├── common/           ← Reusable building blocks (no business logic)
    │   │   ├── ErrorBoundary/
    │   │   ├── Loader/
    │   │   ├── Spinner/
    │   │   ├── EmptyState/
    │   │   ├── Pagination/
    │   │   └── PageTitle/
    │   ├── forms/            ← RHF-connected form field components
    │   │   ├── FormInput/
    │   │   ├── FormPassword/
    │   │   ├── FormSelect/
    │   │   ├── FormCheckbox/
    │   │   ├── FormSwitch/
    │   │   ├── FormTextarea/
    │   │   ├── FormFileUpload/
    │   │   └── index.js      ← Barrel export for all form components
    │   └── ui/               ← Low-level Shadcn/Radix primitives
    │       ├── button.jsx
    │       ├── input.jsx
    │       ├── label.jsx
    │       ├── card.jsx
    │       ├── badge.jsx
    │       ├── dialog.jsx
    │       ├── select.jsx
    │       ├── checkbox.jsx
    │       ├── switch.jsx
    │       ├── tabs.jsx
    │       ├── avatar.jsx
    │       ├── alert.jsx
    │       ├── dropdown-menu.jsx
    │       ├── skeleton.jsx
    │       ├── separator.jsx
    │       ├── sonner.jsx    ← Toast notifications
    │       └── drawer.jsx
    │
    ├── constants/            ← Magic-string-free values shared across the app
    │   ├── routes.js         ← Every URL path as a named constant
    │   ├── queryKeys.js      ← TanStack Query cache key factory
    │   ├── appConstants.js   ← App-wide settings (pagination, timeouts, etc.)
    │   └── storageKeys.js    ← Every localStorage key as a named constant
    │
    ├── features/             ← One folder per product feature
    │   ├── auth/             ← Login, logout, token management
    │   └── dashboard/        ← Dashboard stats, widgets
    │
    ├── hooks/                ← Custom hooks shared across features
    │   ├── useAuth.js        ← Auth actions + Redux selectors
    │   ├── useDebounce.js    ← Debounce a value (search inputs)
    │   ├── useLocalStorage.js← useState backed by localStorage
    │   ├── useMediaQuery.js  ← CSS media query → boolean
    │   └── usePagination.js  ← Pagination state management
    │
    ├── layouts/              ← Page shell components
    │   ├── AuthLayout/       ← Split-panel login/register wrapper
    │   └── DashboardLayout/  ← Sidebar + Header + content area
    │
    ├── lib/                  ← App-level library configuration
    │   ├── queryClient.js    ← TanStack Query global config
    │   └── utils.js          ← cn() helper (Tailwind class merging)
    │
    ├── pages/                ← One file per route (lazy-loaded)
    │   ├── auth/
    │   │   ├── LoginPage.jsx
    │   │   └── ForgotPasswordPage.jsx
    │   ├── dashboard/
    │   │   └── DashboardPage.jsx
    │   ├── NotFoundPage.jsx
    │   └── ErrorPage.jsx
    │
    ├── redux/                ← Redux Toolkit store and slices
    │   ├── store.js
    │   └── slices/
    │       ├── authSlice.js
    │       ├── themeSlice.js
    │       ├── sidebarSlice.js
    │       ├── notificationSlice.js
    │       └── userPreferencesSlice.js
    │
    ├── routes/               ← Routing configuration and guards
    │   ├── index.jsx         ← createBrowserRouter config
    │   ├── ProtectedRoute.jsx← Guards private pages
    │   └── PublicRoute.jsx   ← Guards auth pages (redirect if logged in)
    │
    ├── services/             ← API call functions (not hooks, pure async functions)
    │   └── authService.js
    │
    ├── styles/               ← Global CSS (loaded once in main.jsx)
    │   ├── globals.css       ← Master import + Tailwind + Shadcn tokens
    │   ├── reset.css         ← Browser default override
    │   ├── variables.css     ← CSS custom properties (design tokens)
    │   └── typography.css    ← Font scale, heading styles
    │
    ├── utils/                ← Pure helper functions (no React)
    │   ├── storageUtils.js   ← Safe localStorage/sessionStorage wrappers
    │   ├── tokenUtils.js     ← JWT read/write/decode/expiry check
    │   └── formatUtils.js    ← Date, number, string formatting
    │
    └── validations/          ← Zod schemas (reused by forms and API calls)
        ├── authValidations.js
        └── commonValidations.js
```

---

## 3. Root Configuration Files

### `vite.config.js`

**What it is:** Vite is the build tool. This file is its configuration.

**Why Vite over Create React App?**
CRA is deprecated and slow. Vite uses native ES modules during development — your browser imports files directly, so there's no bundling step. Hot reload is near-instant even on large projects. For production, it uses Rolldown (the Rust-based bundler) to create optimized bundles.

**Key decisions explained:**

```js
plugins: [react(), tailwindcss()]
```
- `@vitejs/plugin-react` — enables JSX transformation and React Fast Refresh (hot reload that preserves component state).
- `@tailwindcss/vite` — Tailwind v4's new integration. In v4, Tailwind is a Vite plugin, not a PostCSS plugin. This is **faster** and removes the need for `postcss.config.js`.

```js
resolve: { alias: { '@': path.resolve(__dirname, './src') } }
```
This makes `@/` an alias for `src/`. Instead of writing `../../../../components/ui/button`, you write `@/components/ui/button`. This works everywhere — imports, CSS modules, everything.

```js
server: { port: 3000, proxy: { '/api': { target: ... } } }
```
The dev proxy forwards `/api/*` requests to your backend. This solves CORS issues during development — your browser thinks it's talking to localhost:3000, but Vite secretly forwards to your API server.

```js
build: {
  rollupOptions: {
    output: {
      manualChunks: (id) => { ... }
    }
  }
}
```
**Why manually split chunks?**
Without this, everything goes into one giant `bundle.js`. With code splitting, the browser only downloads the code it needs. A user on the Login page doesn't download the Dashboard code. Each chunk is also independently cacheable by the CDN.

**Chunks created:**
- `vendor` — React + React DOM (rarely changes, CDN-cached long-term)
- `router` — React Router
- `query` — TanStack Query
- `redux` — Redux Toolkit + React Redux
- `forms` — React Hook Form + Zod
- `ui` — Radix UI primitives
- Individual page chunks — loaded only when that route is visited

> **Vite 8 gotcha:** Vite 8 uses Rolldown instead of Rollup. Rolldown requires `manualChunks` to be a **function** `(id) => string`, not an object `{ chunk: ['package'] }`. This is why the config uses the function form.

---

### `eslint.config.js`

**What it is:** ESLint checks your code for bugs and style issues as you type and before commits.

**Why flat config format?**
ESLint v9+ deprecated the old `.eslintrc.*` format. The new "flat config" (`eslint.config.js`) is what all future tooling targets. It's a plain JS array — no magic plugin loading, no hidden config merging.

**Why no `eslint-plugin-react`?**
This is an important decision. `eslint-plugin-react` v7 **crashes** with ESLint v10 flat config because it calls `context.getFilename()` which was removed. The rules it provides are also largely unnecessary in 2026:
- `react/react-in-jsx-scope` — not needed because React 19 has the automatic JSX transform (no manual `import React from 'react'`)
- `react/prop-types` — prop-types library is deprecated in favour of TypeScript
- `react/display-name` — caught by your IDE, not needed in CI

**What we DO use:**
- `eslint-plugin-react-hooks` — enforces the Rules of Hooks (`useEffect` dependency arrays, hooks only at top level). These are **real runtime bugs** that the linter catches.
- `eslint-plugin-react-refresh` — warns when a file exports non-component values alongside components, which breaks Vite's Fast Refresh. Prevents silent HMR failures.

---

### `.prettierrc`

**What it is:** Prettier is an opinionated code formatter. It reformats your code automatically, ending debates about tabs vs spaces.

**Key settings:**
- `"singleQuote": true` — JS strings use `'single quotes'`
- `"jsxSingleQuote": false` — JSX attributes use `"double quotes"` (matches HTML convention)
- `"printWidth": 100` — lines wrap at 100 characters (wider than the default 80, suits modern monitors)
- `"trailingComma": "es5"` — trailing commas on multi-line arrays/objects (valid in ES5+, reduces git diffs when adding items)
- `"endOfLine": "lf"` — Unix line endings (prevents Windows CRLF polluting git diffs)

---

### `.husky/pre-commit`

**What it is:** Husky hooks into git. When you run `git commit`, Husky runs `npx lint-staged` first. If lint-staged fails, the commit is **blocked**.

**Why this matters:** It makes broken/unformatted code impossible to commit. Every developer on the team gets the same code style automatically — they can't accidentally skip it.

**`lint-staged`** (configured in `package.json`):
```json
"lint-staged": {
  "src/**/*.{js,jsx}": ["eslint --fix", "prettier --write"],
  "src/**/*.css": ["prettier --write"]
}
```
It only lints **staged files** (files you're about to commit), not the entire codebase. This keeps commits fast.

---

### `components.json`

**What it is:** Configuration for Shadcn UI's CLI tool.

**Why Shadcn UI?**
Shadcn is not a component library in the traditional sense. It's a **component registry** — you copy component source code into your project. This means:
- You own the code. You can modify any component freely.
- No version upgrade headaches (no `@shadcn/ui@3.0` breaking changes)
- The components are built on **Radix UI** primitives, which handle all accessibility (keyboard navigation, screen readers, focus management) correctly

```json
{
  "tsx": false            ← We use JSX, not TSX (no TypeScript)
  "tailwind": {
    "css": "src/styles/globals.css"   ← Where CSS variables are defined
    "cssVariables": true              ← Use CSS vars (not Tailwind color classes)
  }
  "aliases": {
    "utils": "@/lib/utils"           ← Where the cn() helper lives
    "ui": "@/components/ui"          ← Where UI components live
  }
}
```

---

### `.env.example` and `.env.development`

**What they are:** Environment variable files.

**Why two files?**
- `.env.example` — committed to git. Shows every variable the app needs, with placeholder values. Any new developer clones the repo, copies this to `.env.development`, fills in real values, and is running.
- `.env.development` — NOT committed to git (listed in `.gitignore`). Contains real values for local development.

**Why `VITE_` prefix?**
Vite only exposes environment variables that start with `VITE_` to your browser code (via `import.meta.env.VITE_*`). Variables without this prefix are private to the Node.js build process. This prevents accidentally leaking server-only secrets.

**CRITICAL SECURITY:** `VITE_*` variables are embedded in the JavaScript bundle that the browser downloads. **Never put passwords, private API keys, or secrets here.** Only put public-facing configuration like base URLs.

---

### `index.html`

**What it is:** The single HTML file the browser loads. Vite injects all JS and CSS into it during build.

**Key sections:**
- Meta tags for SEO and social sharing (Open Graph / Twitter)
- `<div id="root">` — React mounts here
- `<script type="module" src="/src/main.jsx">` — Vite's entry point
- `<noscript>` — Message for browsers without JS enabled
- Security headers (`X-Content-Type-Options`, `X-Frame-Options`) — supplementary to server-side headers

**Why a Single Page App (SPA)?**
The entire React app lives in this one HTML file. When you navigate to `/dashboard`, the browser doesn't load a new HTML file — React Router intercepts the URL change and swaps out components. This makes navigation instantaneous.

---

## 4. Entry Points — `main.jsx` and `App.jsx`

### `src/main.jsx`

**What it does:** Creates the React root and renders `<App />` into the `#root` div.

```jsx
import '@/styles/globals.css';  // ← CSS is imported here, applied globally
```

**Why `StrictMode`?**
React's `<StrictMode>` wrapper intentionally double-invokes certain functions (like `useState` initializers and `useEffect` cleanup) in development only. This surfaces bugs caused by:
- Impure render functions
- Missing cleanup in effects
- Deprecated lifecycle methods

It has zero effect on production builds. Always keep it.

---

### `src/App.jsx`

**What it does:** The root component. Its entire job is wrapping the app in **providers**.

```
<ReduxProvider store={store}>        ← Makes Redux store available everywhere
  <QueryClientProvider client={...}> ← Makes TanStack Query available everywhere
    <AppInner />
    <ReactQueryDevtools />            ← Dev-only debugging panel
  </QueryClientProvider>
</ReduxProvider>
```

**Why `AppInner` is separate from `App`?**
`AppInner` needs to call `useDispatch()` (a Redux hook). But `useDispatch()` only works inside a `<Provider>`. So we need a component *inside* the Provider that can use Redux hooks. `AppInner` sits inside `<ReduxProvider>`, so it has access to Redux.

**What `AppInner` does:**
1. On mount, dispatches `initTheme()` to apply the saved dark/light preference to `<html>` class
2. Listens for `auth:logout` custom events — these are dispatched by the Axios interceptor when a refresh token fails. This triggers a Redux `logout()` and clears the TanStack Query cache so stale user data doesn't persist.

**`auth:logout` event — why this pattern?**
The Axios interceptor (`src/api/axios.js`) doesn't have access to the Redux store. Importing the store directly into Axios would create a circular dependency. Instead, Axios fires a browser `CustomEvent`. `AppInner` listens for that event and dispatches the Redux action. Loose coupling, no circular imports.

---

## 5. Styles — The CSS Architecture

This project uses **three complementary styling systems** that each serve a different purpose. Understanding when to use which is essential.

### `src/styles/globals.css` — The Master CSS File

**Imported once** in `main.jsx`. This is the only global CSS file. Everything else is either scoped (CSS Modules) or a component-level Tailwind class.

```css
@import './reset.css';
@import './variables.css';
@import './typography.css';
@import 'tailwindcss';   ← Tailwind v4: single line replaces @tailwind base/components/utilities
```

**The `@theme {}` block:**
Tailwind v4 introduces `@theme` — a way to bridge CSS custom properties into Tailwind's utility class system. When you write:
```css
@theme {
  --color-primary: var(--primary);
}
```
You can then use `bg-primary`, `text-primary` etc. as Tailwind classes, and they read the CSS variable value at runtime. This is how dark mode works — the CSS variables change, Tailwind classes pick up the new values.

**The Shadcn color system:**
All colors are defined as `hsl()` values in CSS variables:
```css
:root {
  --primary: 221.2 83.2% 53.3%;   /* note: no hsl() wrapper */
}
```
Usage: `background-color: hsl(var(--primary))`. The reason for omitting `hsl()` in the variable is that it allows you to construct the final value: `hsl(var(--primary) / 0.5)` for a semi-transparent version.

---

### `src/styles/reset.css` — Browser Default Override

**Why:** Every browser ships with its own default styles (margins on `<h1>`, padding on `<ul>`, etc.). These differ between browsers. A reset removes them so you start from a consistent baseline.

**Why not normalize.css?**
Normalize.css makes browsers behave *consistently*. Our reset goes further — it removes defaults entirely because we control all styling through Tailwind and CSS Modules. We don't want browser defaults interfering.

**Key resets:**
- `box-sizing: border-box` — makes width/height include padding and border (not just content)
- `-webkit-font-smoothing: antialiased` — smoother fonts on macOS
- `list-style: none` on `ul/ol` — we style lists ourselves
- `#root { isolation: isolate }` — creates a new stacking context, preventing z-index leakage from React components affecting the page

---

### `src/styles/variables.css` — Design Tokens

**What it is:** CSS custom properties (variables) for values used in CSS Modules that aren't in Tailwind.

**Why separate from globals.css?**
Separation of concerns. `globals.css` deals with Tailwind/Shadcn integration. `variables.css` is purely our design tokens.

**What lives here:**
- `--space-*` — spacing scale for margins/padding in CSS Modules
- `--z-*` — z-index layers (prevents random z-index values like `z-index: 9999` appearing in code)
- `--transition-*` — animation durations
- `--shadow-*` — box shadows
- `--sidebar-width`, `--header-height` — layout dimensions used by both the sidebar and main content area

**Why use CSS variables instead of hardcoding values?**
```css
/* BAD */
.sidebar { width: 260px; }
.main { margin-left: 260px; }  /* repeated everywhere, easy to forget to update one */

/* GOOD */
:root { --sidebar-width: 260px; }
.sidebar { width: var(--sidebar-width); }
.main { margin-left: var(--sidebar-width); }  /* change the variable, everything updates */
```

---

### `src/styles/typography.css` — Text Foundation

**What it is:** Base font scale and heading styles applied globally.

**Why define text sizes as CSS variables?**
So CSS Modules can use them: `font-size: var(--text-sm)` is more readable than `font-size: 0.875rem`. The variable name communicates intent.

**Why not use Tailwind for typography?**
For headings and body text that should be consistent across the app, global CSS is cleaner. Tailwind is better for *component-level* variations. We don't want to add `text-2xl font-semibold tracking-tight` to every `<h3>` in the app.

---

### CSS Modules (`.module.css` files)

Every component that needs non-trivial styling has a `.module.css` file beside it.

**Why CSS Modules over plain CSS?**
CSS Modules automatically generate unique class names at build time:
```css
/* You write: */
.button { color: red; }

/* Browser sees: */
.button_3xKj2 { color: red; }
```
This means `.button` in `Header.module.css` and `.button` in `Sidebar.module.css` are completely independent. No class name collisions, no specificity wars.

**Usage pattern:**
```jsx
import styles from './Header.module.css';

const Header = () => (
  <header className={styles.header}>     {/* scoped CSS */}
    <button className="mr-2 h-9 w-9">   {/* Tailwind for layout */}
```

---

## 6. Constants

### `src/constants/routes.js`

**What it is:** Every URL path as a named JavaScript constant.

**Why not hardcode paths?**

```jsx
/* BAD — magic strings */
<Link to="/dashboard">Dashboard</Link>
navigate("/login");
if (location.pathname === "/dashboard") { ... }
```

If you rename `/dashboard` to `/app/dashboard`, you must find and update every string across hundreds of files. Miss one and you have a broken link.

```jsx
/* GOOD — named constants */
import { ROUTES } from '@/constants/routes';
<Link to={ROUTES.DASHBOARD}>Dashboard</Link>
```

Change `DASHBOARD: '/app/dashboard'` in one place and everything follows.

---

### `src/constants/queryKeys.js`

**What it is:** A factory object that generates TanStack Query cache keys.

**Why this is critical:**

TanStack Query uses "query keys" to identify cached data. A query key is an array:
```js
['users', 'list', { page: 1, search: 'john' }]
```

If you write these as literals throughout your codebase:
```js
// In UserList.jsx
useQuery({ queryKey: ['users', 'list', filters] })

// In UserCreateModal.jsx  
queryClient.invalidateQueries({ queryKey: ['user', 'list'] })
//                                                 ^^^^ typo! 'user' not 'users'
// Bug: creating a user doesn't refresh the list
```

The key factory prevents this:
```js
export const queryKeys = {
  users: {
    all: () => ['users'],
    lists: () => ['users', 'list'],
    list: (filters) => ['users', 'list', filters],
    detail: (id) => ['users', 'detail', id],
  }
}

// Everywhere in the app:
queryClient.invalidateQueries({ queryKey: queryKeys.users.all() })
// Invalidates ALL user queries (list + details) with one line
```

**The hierarchy matters for invalidation:**
- `queryKeys.users.all()` → `['users']` — matches ANY query starting with `'users'`
- `queryKeys.users.lists()` → `['users', 'list']` — matches any user list (any page, any filter)
- `queryKeys.users.list(filters)` → `['users', 'list', { page: 1 }]` — exact query

TanStack Query's `invalidateQueries` does prefix matching, so invalidating `['users']` clears both `['users', 'list', ...]` and `['users', 'detail', 42]`.

---

### `src/constants/appConstants.js`

**What it is:** App-wide settings.

```js
export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
};
```

Used by: `usePagination.js` (default values), `buildPaginationParams` helper, any paginated list component. One change here updates all paginated tables.

```js
export const HTTP_STATUS = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  ...
};
```
Used in: `axios.js` interceptors, error handling. Prevents magic numbers like `if (error.status === 401)`.

---

### `src/constants/storageKeys.js`

**What it is:** Every `localStorage` and `sessionStorage` key as a named constant.

**Why:** LocalStorage is global. If two parts of the app both use the string `'token'`, they'll collide. If you rename the key, you have to find every string. A constant fixes both problems.

```js
export const STORAGE_KEYS = {
  ACCESS_TOKEN: import.meta.env.VITE_AUTH_TOKEN_KEY || 'app_access_token',
  REFRESH_TOKEN: import.meta.env.VITE_AUTH_REFRESH_TOKEN_KEY || 'app_refresh_token',
  USER: 'app_user',
  THEME: 'app_theme',
  SIDEBAR_COLLAPSED: 'app_sidebar_collapsed',
};
```

The `app_` prefix prevents collisions with third-party scripts that might also use localStorage.

---

## 7. Utilities

### `src/utils/storageUtils.js`

**What it is:** Safe wrappers around `localStorage` and `sessionStorage`.

**Why wrappers instead of using localStorage directly?**

`JSON.parse` can throw:
```js
localStorage.setItem('data', 'not-valid-json');
JSON.parse(localStorage.getItem('data')); // throws SyntaxError
```

`localStorage` itself can throw:
```js
localStorage.setItem('key', 'value'); // throws QuotaExceededError if storage full
localStorage.getItem('key'); // throws in iOS Safari private browsing mode
```

Our `storage.get(key, fallback)` catches all of these and returns the fallback value, preventing crashes.

**Usage pattern:**
```js
const user = storage.get(STORAGE_KEYS.USER, null);  // null if missing or corrupt
storage.set(STORAGE_KEYS.THEME, 'dark');             // returns true/false (success/failure)
storage.remove(STORAGE_KEYS.USER);
```

---

### `src/utils/tokenUtils.js`

**What it is:** Everything related to JWT tokens.

**Key functions:**

`setTokens({ accessToken, refreshToken })` — stores both tokens in localStorage.

`isExpired(token)` — decodes the JWT payload (the middle section, base64-decoded) and compares `exp` (expiry timestamp) to `Date.now()`. This is **client-side only** — it does not verify the signature. The server validates the signature. We just check expiry to decide if we should try a refresh.

`clearTokens()` — removes both tokens. Called on logout.

**Why localStorage and not httpOnly cookies?**

| | localStorage | httpOnly Cookie |
|--|--|--|
| XSS exposure | Yes (JS-readable) | No (not accessible to JS) |
| CSRF exposure | No (not auto-sent) | Yes (auto-sent on every request) |
| Manual header injection | Yes (we control the header) | Need `credentials: 'include'` |
| Server config needed | No | Yes (SameSite, Secure, CORS) |

For APIs that don't set httpOnly cookies (most REST APIs), localStorage is the practical choice. Mitigate XSS risk with Content Security Policy and by never inserting user-provided HTML.

---

### `src/utils/formatUtils.js`

**What it is:** Pure functions for displaying data to users.

**Functions:**
- `formatDate(date, fmt)` — Converts ISO strings to readable dates using `date-fns`. Handles invalid dates gracefully (returns `''`).
- `formatRelativeTime(date)` — "3 hours ago", "yesterday" etc.
- `formatCurrency(amount, currency)` — Uses `Intl.NumberFormat`, so it respects locale settings automatically.
- `formatFileSize(bytes)` — `1536000` → `"1.47 MB"`
- `truncate(str, maxLength)` — Adds `…` if string exceeds length.
- `initials(name)` — `"John Doe"` → `"JD"` for avatar fallbacks.

**Why `date-fns` instead of `dayjs` or `moment`?**
`date-fns` is tree-shakeable. You only bundle the functions you import. `moment.js` bundles everything (200KB+). `date-fns` ships about 2KB for `format` + `formatDistanceToNow`.

---

## 8. API Layer

### `src/api/axios.js` — The Axios Instance

**What it is:** One Axios instance that every API call uses. This is the most important file in the `api/` folder.

**Why a single shared instance?**
If every file creates its own `axios.create()`, you have to set the base URL, timeout, and interceptors in multiple places. A single instance means one place for all configuration.

**The request interceptor:**
```js
apiClient.interceptors.request.use((config) => {
  const token = tokenUtils.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```
Every outgoing request automatically gets the `Authorization` header injected. Developers never manually add `headers: { Authorization: ... }` to their API calls.

**The response interceptor — Refresh Token Flow:**

This is the most complex part. Here's what happens when an access token expires:

```
Request → Server → 401 Unauthorized
              ↓
   Is this request already a retry? (originalRequest._retry)
         ↓ No
   Is a refresh already in progress? (isRefreshing)
         ↓ No
   Set isRefreshing = true
   POST /auth/refresh with refreshToken
         ↓ Success
   Store new accessToken + refreshToken
   processQueue(null, newToken)  ← Replay queued requests
   Retry originalRequest with new token
```

**The `failedQueue` — why it exists:**
Imagine the token expires and simultaneously 5 API calls fail with 401. Without queuing:
- All 5 would try to refresh the token at the same time
- This could invalidate the refresh token (many servers only accept each refresh token once)
- Race condition: which one wins?

With queuing:
- The first 401 starts a refresh (sets `isRefreshing = true`)
- The other 4 requests add themselves to `failedQueue` (they wait, not retry)
- When the refresh succeeds, all 4 queued requests are replayed with the new token

This is transparent to the user — they never see a login redirect for a simple token expiry.

---

### `src/api/endpoints.js`

**What it is:** Every API endpoint URL as a named property.

**Why not write URLs inline?**
```js
/* BAD */
api.post('/auth/login', data)           // in LoginPage
api.get('/auth/me')                     // in useProfile hook
api.post('/auth/refresh', { token })    // in axios interceptor
// 3 different places reference /auth — hard to find all of them
```

```js
/* GOOD */
import { endpoints } from '@/api/endpoints';
api.post(endpoints.auth.login, data)
api.get(endpoints.auth.me)
api.post(endpoints.auth.refresh, { token })
```

If the backend renames `/auth/login` to `/v2/auth/login`, you change it in ONE place.

**Functions for parameterized endpoints:**
```js
users: {
  detail: (id) => `/users/${id}`,
  update: (id) => `/users/${id}`,
}
```
Usage: `api.get(endpoints.users.detail(42))` — cleaner than template literals at every call site.

---

### `src/api/helpers.js`

**What it is:** Thin wrappers around the Axios instance that automatically unwrap `.data`.

**Why unwrap `.data`?**

Every Axios response looks like:
```js
{
  data: { id: 1, name: 'John' },  // ← your actual payload
  status: 200,
  statusText: 'OK',
  headers: { ... },
  config: { ... },
  request: { ... }
}
```

99% of the time you only want `.data`. Without helpers:
```js
const response = await apiClient.get('/users/1');
const user = response.data;  // repeated everywhere
```

With helpers:
```js
const user = await api.get('/users/1');  // already unwrapped
```

**The `upload` helper:**
```js
upload: (url, formData, onUploadProgress) => ...
```
File uploads need `Content-Type: multipart/form-data` and want a progress callback. This helper handles both. Usage:
```js
await api.upload(endpoints.users.avatar(id), formData, (e) => {
  setProgress(Math.round(e.loaded * 100 / e.total));
});
```

**`getApiErrorMessage(error)`:**
Extracts a human-readable error message from an Axios error, checking in order:
1. `error.response.data.message` — server sent a message
2. `error.response.data.error` — server sent an error string
3. `error.message` — Axios/network error message
4. Generic fallback string

Used in form `onSubmit` handlers: `toast.error(getApiErrorMessage(err))`

---

## 9. Redux — Global Client State

### Why Redux Toolkit (RTK) instead of plain Redux?

Plain Redux requires writing:
1. Action type string constants: `const SET_USER = 'auth/SET_USER'`
2. Action creator functions: `const setUser = (user) => ({ type: SET_USER, payload: user })`
3. Reducer switch/case: `case SET_USER: return { ...state, user: action.payload }`

RTK generates all of this from a `createSlice` call:
```js
const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null },
  reducers: {
    setUser(state, action) { state.user = action.payload } // RTK uses Immer — direct mutation is safe
  }
})
export const { setUser } = authSlice.actions;
```
RTK also bundles Immer (enables direct state mutation in reducers), Redux Thunk (async actions), and Redux DevTools support.

---

### `src/redux/store.js`

**What it is:** The Redux store combining all slices.

```js
const store = configureStore({
  reducer: {
    auth: authReducer,
    theme: themeReducer,
    sidebar: sidebarReducer,
    notifications: notificationReducer,
    userPreferences: userPreferencesReducer,
  }
})
```

State shape: `store.getState()` returns:
```js
{
  auth: { isAuthenticated, user, token, isLoading, error },
  theme: { mode },
  sidebar: { isCollapsed, isMobileOpen },
  notifications: { items: [] },
  userPreferences: { language, dateFormat, density, pageSize }
}
```

**`serializableCheck`:** Redux warns if you put non-serializable values (like Date objects) in state. We suppress this warning for `notifications.items` because notification timestamps are Date objects.

**`devTools: import.meta.env.VITE_ENABLE_DEVTOOLS === 'true'`:** Redux DevTools browser extension is only enabled in development. In production, there's no time-travel debugger exposed.

---

### `src/redux/slices/authSlice.js`

**What it is:** Manages authentication state.

**`rehydrateFromStorage()` — the critical function:**
When the user refreshes the browser, React remounts from scratch. Redux state is empty. This function runs at initialization:
1. Checks localStorage for an access token
2. If found, decodes it and checks if it's expired
3. If valid, loads the user from localStorage
4. Returns initial state as `{ isAuthenticated: true, user: {...} }`

Without this, every browser refresh logs the user out.

**`setCredentials` — called after login:**
```js
setCredentials(state, action) {
  const { user, accessToken, refreshToken } = action.payload;
  state.isAuthenticated = true;
  state.user = user;
  state.token = accessToken;
  tokenUtils.setTokens({ accessToken, refreshToken });
  storage.set(STORAGE_KEYS.USER, user);
}
```
Both Redux state (in-memory, fast access) AND localStorage (survives refresh) are updated.

**`logout` — called on logout or token refresh failure:**
Clears both Redux state and localStorage. The Axios interceptor also fires `auth:logout` event which triggers this.

**Selectors:**
```js
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectCurrentUser = (state) => state.auth.user;
```
Selectors are exported functions. Components call `useSelector(selectIsAuthenticated)` instead of `useSelector(state => state.auth.isAuthenticated)`. Benefits:
- Refactor the state shape in one place (just update the selector)
- Memoization is easier to add later

---

### `src/redux/slices/themeSlice.js`

**What it is:** Dark mode management.

**How dark mode works:**
1. Theme preference stored in localStorage as `'light'`, `'dark'`, or `'system'`
2. On app load (`initTheme` dispatched from `AppInner`), the theme is read from Redux and applied to `document.documentElement.classList`
3. All styles check for `.dark` on `<html>`:
   - Tailwind: `dark:bg-gray-900` — uses `.dark` prefix
   - Shadcn CSS variables: `:root {}` for light, `.dark {}` for dark — variables change, all components update
4. When user toggles theme, `toggleTheme` is dispatched, the class changes, everything re-renders with new colors

The `applyTheme()` function is called both in the reducer (for immediate UI update) and in `initTheme` (on page load).

---

### `src/redux/slices/sidebarSlice.js`

**What it is:** Sidebar open/collapsed state.

**Why Redux for sidebar state?**
The sidebar collapse state is needed by:
- `Sidebar.jsx` (shows collapsed/expanded icon)
- `DashboardLayout.jsx` (adjusts `margin-left` of content area)
- `Header.jsx` (adjusts `left` position on desktop)

Three separate components in three separate files, none of which are parent/child. This is exactly what Redux is for — shared UI state across unrelated components.

**`isCollapsed` vs `isMobileOpen`:**
- `isCollapsed` — desktop: sidebar is narrow (64px) vs. wide (260px). Persisted to localStorage.
- `isMobileOpen` — mobile: sidebar slides in from off-screen as an overlay. NOT persisted (always starts closed on mobile).

---

### `src/redux/slices/notificationSlice.js`

**What it is:** In-app notification queue (not to be confused with browser push notifications).

**Use case:** Real-time WebSocket notifications from the server. When a background job completes, the server pushes a notification. We dispatch `addNotification({ title: 'Export complete', type: 'success' })` and a notification bell badge shows the count.

**Note:** This is separate from Sonner toasts. Toasts are ephemeral (auto-dismiss after a few seconds). Notifications persist in the notification panel until dismissed.

---

### `src/redux/slices/userPreferencesSlice.js`

**What it is:** User-configurable settings that affect the UI.

```js
const defaultPreferences = {
  language: 'en',
  dateFormat: 'MM/dd/yyyy',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,  // auto-detected
  density: 'comfortable',  // 'compact' | 'comfortable' | 'spacious'
  pageSize: 20,
};
```

`density` controls table row height, card padding, etc. Useful for power users who want to see more data.
`pageSize` sets the default number of items per page across all paginated tables.
`timezone` — the user's local timezone, used to display dates correctly in their local time.

---

## 10. TanStack Query — Server State

### `src/lib/queryClient.js`

**What it is:** The global TanStack Query configuration.

**Understanding the cache settings:**

```js
staleTime: 1 * 60 * 1000  // 1 minute
```
For the first 1 minute after data is fetched, it's considered "fresh". During this window:
- Navigating away and back does NOT refetch
- Switching browser tabs and back does NOT refetch

After 1 minute, data becomes "stale". Next time the query is used, it refetches **in the background** while showing the old (stale) data immediately. This is TanStack Query's killer feature — users always see data instantly, and it silently updates.

```js
gcTime: 5 * 60 * 1000  // 5 minutes (formerly cacheTime)
```
After a query becomes unused (no components are watching it), the cache entry is kept for 5 minutes. If you navigate back within 5 minutes, the data is available instantly from cache. After 5 minutes, the memory is freed (garbage collected).

**Retry strategy:**
```js
retry: (failureCount, error) => {
  const status = error?.response?.status;
  if (status === 401 || status === 403 || status === 404) {
    return false;  // never retry these
  }
  return failureCount < 2;  // retry network errors up to 2 times
}
```
- **401 Unauthorized**: Retrying won't help — the user needs to log in
- **403 Forbidden**: Retrying won't help — the user doesn't have permission
- **404 Not Found**: Retrying won't help — the resource doesn't exist
- **500/503/network errors**: Might be transient — retry up to 2 times with exponential backoff

**`retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30_000)`**

Exponential backoff:
- 1st retry: wait 1 second
- 2nd retry: wait 2 seconds
- (capped at 30 seconds for very slow services)

---

## 11. Hooks

### `src/hooks/useAuth.js`

**What it is:** The primary hook for authentication. Components never import from Redux or `authService` directly — they use this hook.

**Why an abstraction layer?**
```jsx
/* Without useAuth — component directly depends on Redux */
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser } from '@/redux/slices/authSlice';
const user = useSelector(selectCurrentUser);

/* With useAuth — component is decoupled from Redux */
import { useAuth } from '@/hooks/useAuth';
const { user } = useAuth();
```

If you ever change from Redux to Zustand or Context, you update `useAuth.js` and every component automatically works.

**`hasRole(...roles)` and `hasAnyRole(...roles)`:**
```js
const { hasRole } = useAuth();
if (hasRole('admin')) { /* show admin panel */ }
if (hasAnyRole('manager', 'admin')) { /* show management tools */ }
```
Used in protected sections, conditional renders, and `ProtectedRoute` role guards.

---

### `src/hooks/useDebounce.js`

**What it is:** Returns a value that only updates after a pause.

**Why it's needed:**

```jsx
/* Without debounce — API call on every keystroke */
const [search, setSearch] = useState('');
const { data } = useQuery({
  queryKey: queryKeys.users.list({ search }),
  queryFn: () => api.get('/users', { search }),
});
// User types "john smith" = 10 API calls
```

```jsx
/* With debounce — API call only after user stops typing */
const [search, setSearch] = useState('');
const debouncedSearch = useDebounce(search, 300);
const { data } = useQuery({
  queryKey: queryKeys.users.list({ search: debouncedSearch }),
  queryFn: () => api.get('/users', { search: debouncedSearch }),
});
// User types "john smith" = 1 API call (300ms after last keystroke)
```

The 300ms default is the sweet spot between responsiveness and request reduction.

---

### `src/hooks/useLocalStorage.js`

**What it is:** `useState` backed by localStorage. State persists through browser refreshes.

**Usage:**
```js
const [rememberMe, setRememberMe, clearRememberMe] = useLocalStorage('remember_me', false);
```
Behaves exactly like `useState` but also reads from and writes to localStorage automatically.

---

### `src/hooks/useMediaQuery.js`

**What it is:** Returns a boolean that tracks whether a CSS media query matches.

**Usage:**
```js
const isMobile = useIsMobile();    // true on screens < 768px
const isDesktop = useIsDesktop();  // true on screens >= 1024px

// Conditionally render
{isMobile ? <MobileMenu /> : <DesktopNav />}
```

**Why use this instead of CSS only?**
Sometimes you need to conditionally render (not just style) different components. A mobile hamburger menu is a different component than a desktop nav — you want to mount/unmount them, not just show/hide with CSS, so that keyboard focus and screen readers aren't confused by hidden elements.

---

### `src/hooks/usePagination.js`

**What it is:** All pagination state in one hook.

**Usage:**
```jsx
const { data } = useQuery({
  queryKey: queryKeys.users.list({ page, pageSize }),
  queryFn: () => api.get('/users', { page, pageSize }),
  placeholderData: (previousData) => previousData, // keep previous page visible while loading
});

const pagination = usePagination({ initialPageSize: 20, total: data?.total });

return (
  <>
    <UserTable data={data?.items} />
    <Pagination
      {...pagination}
      onFirst={pagination.goToFirstPage}
      onPrevious={pagination.goToPreviousPage}
      onNext={pagination.goToNextPage}
      onLast={pagination.goToLastPage}
      onPageChange={pagination.goToPage}
    />
  </>
);
```

`placeholderData` is TanStack Query's "keep previous data" feature — when you go to page 2, the page 1 data stays visible until page 2 loads. No blank screen between pages.

---

## 12. Validations — Zod Schemas

### `src/validations/commonValidations.js`

**What it is:** Reusable Zod schema pieces shared across multiple forms.

**Why Zod?**
- TypeScript-first, but works in JavaScript too (we use it)
- Schema and error messages in one place
- `.parse()` validates AND transforms (e.g., `z.coerce.date()` converts strings to Date)
- Works seamlessly with React Hook Form via `@hookform/resolvers/zod`

**Examples:**
```js
export const emailSchema = z.string()
  .email('Please enter a valid email address')
  .min(1, 'Email is required');

export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/\d/, 'Password must contain at least one number');
```

**Composition — why it matters:**
```js
// loginSchema REUSES emailSchema — change the email rule once, affects all forms
export const loginSchema = z.object({
  email: emailSchema,      // ← imported from commonValidations
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional().default(false),
});
```

---

### `src/validations/authValidations.js`

**Zod v4 refinements (cross-field validation):**
```js
export const resetPasswordSchema = z.object({
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    path: ['confirmPassword'],  // error appears on the confirmPassword field
    message: 'Passwords do not match',
  }
);
```

`.refine()` validates the entire object (not just one field). The `path` tells React Hook Form which field to attach the error to. Without `path`, the error would appear at the form level, not under `confirmPassword`.

---

## 13. Services

### `src/services/authService.js`

**What it is:** Functions that call the auth API endpoints.

```js
export const authService = {
  login: (credentials) => api.post(endpoints.auth.login, credentials),
  logout: () => api.post(endpoints.auth.logout),
  getProfile: () => api.get(endpoints.auth.me),
  forgotPassword: (email) => api.post(endpoints.auth.forgotPassword, { email }),
};
```

**Why a separate service file instead of calling `api.*` directly in hooks?**

Separation of layers:
- **`hooks/useAuth.js`** — React layer (useState, dispatch, navigate)
- **`services/authService.js`** — Transport layer (what endpoint, what payload shape)
- **`api/axios.js`** — HTTP layer (headers, interceptors, error handling)

If the login endpoint changes from `POST /auth/login` to `POST /v2/sessions`, you change ONE line in `authService.js`. The hook and the component are unchanged.

Also: services can be called from non-React code (e.g., the Axios interceptor's refresh call).

---

## 14. UI Components — Shadcn / Radix

All files in `src/components/ui/` follow the same pattern: they wrap a **Radix UI primitive** with **Tailwind CSS** and re-export clean, styled components.

### Why Radix UI primitives?

Building accessible components from scratch is genuinely hard:
- Dialog: focus trap, scroll lock, escape key handling, ARIA roles
- Select: keyboard navigation, search, multi-select
- Dropdown: position calculation, outside click detection

Radix provides all of this **as unstyled primitives**. We add styles on top. The result: accessible by default, styled our way, no dependency on a component library's design decisions.

---

### `src/components/ui/button.jsx`

Uses `class-variance-authority` (CVA) to define **variants**:

```js
const buttonVariants = cva(
  'base-classes-that-always-apply',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground ...',
        destructive: 'bg-destructive ...',
        outline: 'border border-input ...',
        ghost: 'hover:bg-accent ...',
      },
      size: {
        default: 'h-9 px-4',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-10 px-8',
        icon: 'h-9 w-9',
      }
    }
  }
)
```

Usage: `<Button variant="destructive" size="sm">Delete</Button>`

CVA generates the correct Tailwind classes based on prop values. No conditional class string concatenation, no class conflicts.

**`asChild` prop:**
```jsx
<Button asChild>
  <Link to="/login">Sign in</Link>
</Button>
```
Uses Radix's `<Slot>` to merge Button's styles onto the child element (the `<Link>`), instead of wrapping in a `<button>`. This gives you button styling on a router link without nesting a link inside a button (invalid HTML).

---

### `src/components/ui/sonner.jsx`

**What it is:** The toast notification provider, themed to match the current dark/light mode.

```jsx
const Toaster = () => {
  const isDark = useSelector(selectIsDark);
  return <Sonner theme={isDark ? 'dark' : 'light'} ... />
}
```

**Used via:**
```js
import { toast } from 'sonner';
toast.success('User created successfully!');
toast.error('Failed to save changes.');
toast.promise(api.post(...), {
  loading: 'Saving...',
  success: 'Saved!',
  error: (err) => getApiErrorMessage(err),
});
```

Why Sonner over React-Toastify? Sonner is built for React and has first-class `promise` support, better animation, smaller bundle.

---

### `src/components/ui/skeleton.jsx`

Used for loading states instead of spinners. Shows the shape of content before it arrives:

```jsx
// While loading:
<Skeleton className="h-4 w-24" />   // placeholder for a title
<Skeleton className="h-64 w-full" /> // placeholder for a chart

// After data arrives: show actual content
```

This pattern is called a "Skeleton Screen". Research shows it feels faster than a spinner because users can see the page structure is being built.

---

## 15. Form Components

All form components in `src/components/forms/` follow the same contract:
1. They use `useFormContext()` — they must be inside a `<FormProvider>`
2. They receive a `name` prop that maps to the field in the Zod schema
3. They display the error message from React Hook Form automatically
4. They support `label`, `hint`, `required`, `disabled` props

### How React Hook Form + Zod Works Together

```jsx
const methods = useForm({
  resolver: zodResolver(loginSchema),  // ← Zod validates on submit and on touch
  defaultValues: { email: '', password: '' },
  mode: 'onTouched',  // ← validate after first interaction with a field
});

// methods contains: { register, control, handleSubmit, formState: { errors } }

<FormProvider {...methods}>
  {/* All children can call useFormContext() to get methods */}
  <FormInput name="email" label="Email" />
  {/* FormInput internally calls register('email') and reads errors.email */}
</FormProvider>
```

**`mode: 'onTouched'` vs `mode: 'onChange'` vs `mode: 'onSubmit'`:**
- `onSubmit`: Only validates when form is submitted. Errors appear late. Bad UX for long forms.
- `onChange`: Validates on every keystroke. Shows "email is required" before the user has typed anything. Annoying.
- `onTouched` (our choice): Validates after the user first touches a field and leaves it. Best balance.

---

### `src/components/forms/FormInput/FormInput.jsx`

```jsx
const FormInput = ({ name, label, type, required, ... }) => {
  const { register, formState: { errors } } = useFormContext();
  const error = errors[name];

  return (
    <div>
      <Label>{label}</Label>
      <Input
        {...register(name)}                    // connects to RHF
        aria-invalid={!!error}                 // accessibility
        aria-describedby={`${name}-error`}     // screen readers announce the error
      />
      {error && <p role="alert">{error.message}</p>}
    </div>
  );
};
```

`register(name)` returns `{ onChange, onBlur, ref, name }` — standard HTML input props. RHF tracks the input value and triggers Zod validation based on `mode`.

---

### `src/components/forms/FormPassword/FormPassword.jsx`

Adds a show/hide password toggle button. The toggle state is local (`useState`) — it doesn't need to leave this component. Example of correct local state usage.

---

### `src/components/forms/FormSelect/FormSelect.jsx`

Uses Radix `Select` instead of native `<select>`. Why?
- Native `<select>` is essentially un-styleable across browsers
- Radix Select supports custom options, icons, groups, search
- Keyboard navigation and accessibility work correctly

Uses `<Controller>` from RHF because Radix Select is a **controlled component** (not a native input). `register()` only works with elements that have a `name` attribute and native change events. For custom components, `<Controller>` bridges the gap.

---

### `src/components/forms/FormFileUpload/FormFileUpload.jsx`

A custom file upload with:
- Click to upload OR keyboard (Enter key)
- Preview of selected file (name + size)
- Remove button
- Error state styling
- Uses a hidden native `<input type="file">` (so the OS file picker works correctly)

The `<input type="file">` is hidden and triggered programmatically via `inputRef.current.click()`. This lets us style the entire dropzone area as the click target.

---

## 16. Common Components

### `src/components/common/ErrorBoundary/ErrorBoundary.jsx`

**What it is:** A React class component that catches JavaScript errors in the component tree.

**Why a class component?**
React's error boundary lifecycle methods (`componentDidCatch`, `getDerivedStateFromError`) are only available on class components. There's no functional component equivalent. This is the one place in the codebase where a class component is required.

**What errors it catches:**
- Render errors (component throws during render)
- Lifecycle method errors

**What it does NOT catch:**
- Async errors (inside `setTimeout`, Promise rejections)
- Event handler errors
- Server-side rendering errors

For async/API errors, use TanStack Query's `error` state.

**Usage:**
```jsx
<ErrorBoundary fallback={<p>Custom error UI</p>} onReset={() => refetchData()}>
  <ComponentThatMightCrash />
</ErrorBoundary>
```

In `App.jsx`, it wraps the entire app as a last resort. For specific sections, you can wrap just that section.

---

### `src/components/common/PageTitle/PageTitle.jsx`

**What it is:** Declaratively sets the browser tab title and meta description.

```jsx
// In DashboardPage.jsx:
<PageTitle title="Dashboard" />
// → document.title = "Dashboard | Ienerz"

// In UserDetailPage.jsx:
<PageTitle title="John Doe — User Profile" description="View and edit user details" />
```

**Why not set `document.title` directly in components?**
This hook does it declaratively (as JSX) and handles cleanup — when the component unmounts, it resets the title. It's also centralized so the app name is only in one place.

---

### `src/components/common/Spinner/Spinner.jsx`

A pure CSS animated spinner. Three sizes (`sm`, `md`, `lg`) via CSS Module classes. Used inside `<Loader>` and directly in buttons when submitting:
```jsx
<Button disabled={isSubmitting}>
  {isSubmitting && <Spinner size="sm" />}
  Save
</Button>
```

---

### `src/components/common/EmptyState/EmptyState.jsx`

**Used when a list or query returns zero results:**
```jsx
{data?.items.length === 0 && (
  <EmptyState
    icon={Users}
    title="No users found"
    description="Try adjusting your search or filters."
    action={<Button>Create User</Button>}
  />
)}
```

Consistent empty state across the app instead of each page inventing its own.

---

### `src/components/common/Pagination/Pagination.jsx`

Renders page navigation controls. Takes all values from `usePagination` hook as props.

**Smart page number display:**
- Always shows first, last, and 2 pages around current
- Inserts `…` for gaps
- `1 2 3 … 8 9 10` when on page 1-3
- `1 2 … 5 6 7 … 9 10` when on page 6 of 10

---

## 17. Layouts

### `src/layouts/AuthLayout/AuthLayout.jsx`

A two-column split-panel layout:
```
┌──────────────────────┬──────────────────────┐
│                      │                      │
│    Brand / Logo      │    <Outlet />        │
│    Panel             │    (Login form,      │
│    (left, hidden     │     Register, etc.)  │
│    on mobile)        │                      │
│                      │                      │
└──────────────────────┴──────────────────────┘
```

`<Outlet />` (from React Router) renders the active child route's component. So `AuthLayout` renders once, and the right panel shows `LoginPage` or `ForgotPasswordPage` depending on the URL.

---

### `src/layouts/DashboardLayout/DashboardLayout.jsx`

The main app shell:
```
┌─────────────────────────────────────────────────────┐
│ Header (fixed top, adjusts left based on sidebar)   │
├──────────────┬──────────────────────────────────────┤
│              │                                      │
│   Sidebar    │   <Outlet />                        │
│   (fixed     │   (Dashboard, Users, Settings, ...) │
│   left)      │                                      │
│              │                                      │
└──────────────┴──────────────────────────────────────┘
```

`isCollapsed` from Redux controls the `margin-left` of the main content area. When the sidebar is collapsed (64px wide), the content shifts left. When expanded (260px), it shifts right. CSS transition makes this animated.

---

### `src/layouts/DashboardLayout/Sidebar.jsx`

**Desktop behavior:**
- Starts expanded (260px)
- Collapse button (`<ChevronLeft>`) toggles to 64px (icon-only mode)
- State saved to localStorage (persists across refreshes)

**Mobile behavior:**
- Hidden off-screen by default (`transform: translateX(-100%)`)
- Hamburger in Header dispatches `toggleMobileSidebar`
- Sidebar slides in as an overlay with a backdrop
- Any nav click dispatches `closeMobileSidebar`

**`NavLink` from React Router:**
Automatically applies an `isActive` class when the current URL matches the `to` prop. This is how the active nav item gets the blue highlight.

---

### `src/layouts/DashboardLayout/Header.jsx`

Fixed at the top. Contains:
1. **Hamburger** (mobile only) — opens the sidebar overlay
2. **Theme toggle** — dispatches `toggleTheme()` to Redux
3. **Notification bell** — reads `selectUnreadCount` from Redux
4. **User avatar dropdown** — shows user name/email, Logout option

The Header reads `user` from `useAuth()` (which reads from Redux). No API call — the user object was loaded once during login and is stored in Redux.

---

## 18. Routes

### `src/routes/index.jsx`

Uses `createBrowserRouter` (React Router v7 Library Mode).

**Why `createBrowserRouter` instead of `<BrowserRouter>`?**
`createBrowserRouter` supports the **Data API** — loaders, actions, error elements — which enables server-side data fetching patterns even in SPAs. We're not using loaders yet, but the architecture supports it. Also, `createBrowserRouter` is the recommended approach in React Router v7.

**Route nesting:**
```js
{
  element: <ProtectedRoute />,       // guard
  children: [{
    element: <DashboardLayout />,    // shell
    children: [
      { path: '/dashboard', element: wrap(DashboardPage) }  // page
    ]
  }]
}
```

Each level renders `<Outlet />` to show its children. The page only appears if both the guard passes AND the layout is rendered.

**`wrap(Component)` — lazy loading:**
```js
const DashboardPage = lazy(() => import('@/pages/dashboard/DashboardPage'));
const wrap = (Component) => (
  <Suspense fallback={<Loader />}>
    <Component />
  </Suspense>
);
```

`React.lazy` makes Vite create a separate JS chunk for `DashboardPage`. The chunk is only downloaded when the user navigates to `/dashboard`. `<Suspense>` shows `<Loader />` while the chunk downloads.

---

### `src/routes/ProtectedRoute.jsx`

```jsx
const ProtectedRoute = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    storage.set(STORAGE_KEYS.REDIRECT_URL, location.pathname + location.search);
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return <Outlet />;
};
```

**The redirect URL pattern:**
When an unauthenticated user tries to access `/dashboard/users/42`, we save `/dashboard/users/42` to localStorage. After login, `PublicRoute` reads this and redirects there. Deep links work correctly across auth.

`replace` means the login redirect doesn't add an entry to browser history. Pressing Back goes to wherever the user was before, not an infinite login-redirect loop.

---

### `src/routes/PublicRoute.jsx`

Redirects authenticated users away from auth pages. If you're logged in and try to visit `/login`, you go to `/dashboard` (or wherever `REDIRECT_URL` says).

---

## 19. Pages

### `src/pages/auth/LoginPage.jsx`

**Form lifecycle:**
1. `useForm({ resolver: zodResolver(loginSchema), mode: 'onTouched' })` — creates the form
2. `FormProvider` propagates form methods to all children
3. User fills fields → Zod validates on blur
4. Submit → `handleSubmit(onSubmit)` → Zod validates everything → if valid, calls `onSubmit(data)`
5. `onSubmit` calls `login(data)` from `useAuth`
6. Success → Redux `setCredentials` → navigate to `/dashboard`
7. Failure → `toast.error(getApiErrorMessage(err))`

`isSubmitting` from `formState` is `true` while the async `onSubmit` is running. The button is disabled and shows "Signing in…" during this time, preventing double-submission.

---

### `src/pages/dashboard/DashboardPage.jsx`

Demonstrates the TanStack Query pattern:

```js
const useDashboardStats = () =>
  useQuery({
    queryKey: queryKeys.dashboard.stats(),
    queryFn: () => api.get(endpoints.dashboard.stats),
    staleTime: 2 * 60 * 1000,  // override: dashboard data can be 2 min stale
  });
```

This is a **custom query hook** — a `useQuery` call wrapped in a named function. Benefits:
- Reusable: any component can call `useDashboardStats()` and share the same cached data
- Encapsulated: the query key and API call are together
- Testable: can mock this function in tests

The `StatCard` component shows `<Skeleton>` when `isLoading` is true, actual values after data arrives. No explicit `if (isLoading)` in the page — each card handles its own loading state.

---

## 20. Redux vs TanStack Query — The Golden Rule

This is the most important architectural principle. Getting this wrong causes the most bugs.

### The Question to Ask

**"Does this data have a copy on the server?"**

- **YES** → TanStack Query. The server is the source of truth. Query caches it, keeps it fresh, handles loading/error.
- **NO** → Redux (or local state). You own this data entirely.

### Concrete Examples

| Data | Where | Why |
|------|-------|-----|
| `isAuthenticated` | Redux | No server copy. It's derived from having a valid token. |
| `user.name` (logged-in user) | Redux (cached from login) | Loaded once at login, not fetched per-page. |
| Users list from `/api/users` | TanStack Query | Server owns it. Other users can change it. |
| User detail from `/api/users/42` | TanStack Query | Same reason. |
| `theme: 'dark'` | Redux | Purely client preference, no server involved. |
| `sidebar.isCollapsed` | Redux | UI state, no server. |
| Dashboard stats | TanStack Query | Fetched from server, can change at any time. |
| Current page number | Local `useState` or URL | UI state, no server. |

### What Happens When You Put API Data in Redux

```jsx
// BAD: Fetching users into Redux
dispatch(fetchUsers()); // thunk calls API, stores in Redux

// Problem 1: No automatic background refresh. Data goes stale.
// Problem 2: You write loading/error boilerplate Redux code for EVERY entity.
// Problem 3: Cache invalidation. After creating a user, you dispatch another thunk to reload the list.
// Problem 4: Pagination is hard — do you store all pages or just current?
// Problem 5: Stale-while-revalidate (show old data while fetching new) requires even more code.
```

TanStack Query solves ALL of these problems by design.

---

## 21. Authentication Flow — End to End

```
Browser                   React App                   API Server
   │                          │                            │
   │── Navigate to /login ───>│                            │
   │                          │ PublicRoute: not logged in │
   │                          │ → render LoginPage         │
   │                          │                            │
   │── Type email/password ──>│                            │
   │                          │ Zod validates on blur      │
   │                          │                            │
   │── Click "Sign in" ──────>│                            │
   │                          │ handleSubmit               │
   │                          │ Zod validates all fields   │
   │                          │── POST /auth/login ───────>│
   │                          │                            │ verify credentials
   │                          │<── 200 { accessToken,      │
   │                          │         refreshToken, user }│
   │                          │                            │
   │                          │ dispatch(setCredentials())  │
   │                          │ → Redux: isAuthenticated=true
   │                          │ → localStorage: tokens + user
   │                          │                            │
   │                          │ navigate('/dashboard')     │
   │<── Dashboard renders ────│                            │
   │                          │                            │
   │  (token expires after 15 min)                         │
   │                          │                            │
   │── API call ─────────────>│── GET /users ────────────>│
   │                          │<── 401 Unauthorized ───────│
   │                          │                            │
   │                          │ Axios interceptor          │
   │                          │── POST /auth/refresh ─────>│
   │                          │<── 200 { new accessToken } │
   │                          │                            │
   │                          │ store new token            │
   │                          │── GET /users (retry) ─────>│
   │<── Users data renders ───│<── 200 { users } ──────────│
   │                          │                            │
   │── Click Logout ─────────>│                            │
   │                          │ dispatch(logout())         │
   │                          │ → Redux: isAuthenticated=false
   │                          │ → localStorage: cleared    │
   │                          │── POST /auth/logout ──────>│ (best-effort)
   │                          │ navigate('/login')         │
   │<── Login page renders ───│                            │
```

---

## 22. How to Add a New Feature

Example: Adding a **Products** feature.

### Step 1: Create the feature folder

```
src/features/products/
├── components/
│   ├── ProductTable.jsx
│   ├── ProductTable.module.css
│   ├── ProductForm.jsx
│   └── ProductForm.module.css
├── hooks/
│   ├── useProducts.js       (list query)
│   └── useProductMutations.js (create, update, delete mutations)
└── services/
    └── productsApi.js
```

### Step 2: Add Zod schema (`src/validations/productValidations.js`)

```js
import { z } from 'zod';
import { requiredString, positiveNumber } from './commonValidations';

export const productSchema = z.object({
  name: requiredString('Product name'),
  price: positiveNumber('Price'),
  category: requiredString('Category'),
  description: z.string().optional(),
});
```

### Step 3: Add endpoints (`src/api/endpoints.js`)

```js
products: {
  list: '/products',
  create: '/products',
  detail: (id) => `/products/${id}`,
  update: (id) => `/products/${id}`,
  delete: (id) => `/products/${id}`,
},
```

### Step 4: Add query keys (`src/constants/queryKeys.js`)

```js
products: {
  all: () => ['products'],
  lists: () => ['products', 'list'],
  list: (filters) => ['products', 'list', filters],
  detail: (id) => ['products', 'detail', id],
},
```

### Step 5: Create the service (`src/features/products/services/productsApi.js`)

```js
import { api } from '@/api/helpers';
import { endpoints } from '@/api/endpoints';

export const productsApi = {
  getList: (params) => api.get(endpoints.products.list, params),
  getDetail: (id) => api.get(endpoints.products.detail(id)),
  create: (data) => api.post(endpoints.products.create, data),
  update: (id, data) => api.put(endpoints.products.update(id), data),
  remove: (id) => api.delete(endpoints.products.delete(id)),
};
```

### Step 6: Create query hooks (`src/features/products/hooks/useProducts.js`)

```js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { productsApi } from '../services/productsApi';
import { toast } from 'sonner';

export const useProductList = (filters) =>
  useQuery({
    queryKey: queryKeys.products.list(filters),
    queryFn: () => productsApi.getList(filters),
  });

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: productsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.lists() });
      toast.success('Product created successfully!');
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });
};
```

### Step 7: Create the page (`src/pages/products/ProductsPage.jsx`)

```jsx
import { PageTitle } from '@/components/common/PageTitle/PageTitle';
import { useProductList } from '@/features/products/hooks/useProducts';

const ProductsPage = () => {
  const { data, isLoading } = useProductList({});
  return (
    <>
      <PageTitle title="Products" />
      {/* ... */}
    </>
  );
};
export default ProductsPage;
```

### Step 8: Register the route (`src/routes/index.jsx`)

```js
const ProductsPage = lazy(() => import('@/pages/products/ProductsPage'));

// Inside the ProtectedRoute > DashboardLayout children:
{ path: '/products', element: wrap(ProductsPage) },
```

### Step 9: Add to sidebar (`src/layouts/DashboardLayout/Sidebar.jsx`)

```js
import { Package } from 'lucide-react';

const NAV_ITEMS = [
  ...
  { to: '/products', icon: Package, label: 'Products' },
];
```

Done. The feature is self-contained, the route is protected, and the data is cached.

---

## 23. Styling Guidelines — When to Use What

### Decision Tree

```
Is this a one-off layout tweak on an existing component?
  → Tailwind class (e.g., className="mt-4")

Is this a Shadcn/Radix component style override?
  → className prop with Tailwind + cn() to merge (e.g., cn(buttonVariants(), 'w-full'))

Is this a complex component with many selectors, media queries, or pseudo-classes?
  → CSS Module (ComponentName.module.css)

Is this a value that multiple CSS Modules share (spacing, z-index, shadow)?
  → CSS custom property in variables.css

Is this a body text or heading style that applies everywhere?
  → typography.css global rule

Is this a theme token (primary color, border radius)?
  → globals.css @theme / :root variables (consumed by both Tailwind and Shadcn)
```

### Never do this

```jsx
/* ❌ Inline styles — no hover states, no media queries, hard to maintain */
<div style={{ marginTop: '16px', color: '#333' }}>

/* ❌ Arbitrary values when a token exists */
<div className="mt-[16px]">  // use mt-4 or var(--space-4)

/* ❌ !important — signals a specificity problem, fix the root cause */
.myClass { color: red !important; }
```

---

## 24. Security Architecture

### Token Storage

Access tokens are in `localStorage`. This is readable by JavaScript (XSS risk). Mitigations:

1. **Content Security Policy (CSP)** — Set on your web server (nginx/Apache/CDN). Prevents inline scripts and restricts what domains can run scripts. The `<meta>` in `index.html` is supplementary — real CSP must be an HTTP header.

2. **Short TTL** — Access tokens should expire in 15 minutes. Stolen tokens have a short window.

3. **Refresh token rotation** — Each refresh issues a new refresh token and invalidates the old one. Stolen refresh tokens are detected when two clients try to use the same token.

4. **Never `dangerouslySetInnerHTML`** with user content. If you must render user HTML, install `dompurify`:
```js
import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userHtml) }} />
```

### Environment Variables

`VITE_*` variables are in the JavaScript bundle — anyone can read them in browser DevTools. Never put:
- Database passwords
- Private API keys
- JWT secrets
- Payment processor secret keys

Only put:
- API base URLs
- Public keys (Stripe publishable key, Google Analytics ID)
- Feature flag names
- App version

### Input Sanitization

React escapes strings by default: `<p>{userInput}</p>` renders `&lt;script&gt;`, not a script tag. You only need DOMPurify when using `dangerouslySetInnerHTML`.

For form validation: Zod schemas define the exact shape and content of inputs. Always validate on the **server** too — client validation is UX only.

---

## 25. Available Scripts

```bash
# Development
npm run dev           # Start dev server at http://localhost:3000 with HMR

# Production
npm run build         # Build optimized bundle → dist/
npm run preview       # Serve dist/ locally (test production build before deploy)

# Code Quality
npm run lint          # ESLint check (report only)
npm run lint:fix      # ESLint auto-fix
npm run format        # Prettier format all src/**/*.{js,jsx,css}
npm run format:check  # Prettier check (exits 1 if unformatted — use in CI)
```

### Pre-commit hook (automatic)

On every `git commit`:
1. lint-staged finds the staged files
2. ESLint auto-fixes `*.{js,jsx}`
3. Prettier formats `*.{js,jsx,css}`
4. If ESLint finds unfixable errors → commit blocked, you must fix manually

---

*End of documentation. Every file in this project has an entry in the sections above.*
