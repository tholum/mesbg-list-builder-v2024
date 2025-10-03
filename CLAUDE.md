# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React-based Progressive Web Application (PWA) for building army lists for the Middle-Earth Strategy Battle Game (MESBG). The application uses Vite as a build tool, React Router for navigation, Zustand for state management, and Material-UI for UI components.

## Commands

### Development

- `npm start` - Start development server (localhost only)
- `npm start:host` - Start development server with network access
- `npm run build` - Build production bundle (runs TypeScript check + Vite build + sitemap generation)

### Code Quality

- `npm run check` - Run both Prettier and ESLint checks
- `npm run check:fix` - Auto-fix Prettier and ESLint issues
- `npm run prettier` - Check code formatting
- `npm run prettier:fix` - Auto-fix formatting issues
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Auto-fix ESLint issues

### Data Management

- `npm run build:data` - Generate JSON data files from Excel spreadsheet (requires Python 3)
- `npm run watch:data` - Watch Excel file for changes and regenerate data

### Storybook

- `npm run storybook` - Start Storybook dev server on port 6006
- `npm run build-storybook` - Build static Storybook
- `npm run deploy` - Deploy Storybook to GitHub Pages

### Version Management

- `npm run version` - Update changelog version (cross-platform)

## Architecture

### State Management

The application uses **Zustand** with slices pattern for global state:

- **State location**: `src/state/`
- **Main stores**:

  - `roster-building/` - Manages army roster creation, editing, and warband composition
  - `gamemode/` - Tracks in-game state (Might/Will/Fate, casualties, victory points)
  - `recent-games/` - Match history and results tracking
  - `collection/` - User's model inventory and collection management
  - `app/` - UI state (modals, sidebars)
  - `preference/` - User settings and preferences

- **Slice pattern**: Each store is composed of multiple slices using `src/state/Slice.ts` type helper
- **Middleware**: Stores use `devtools`, `persist` (localStorage), and `temporal` (undo/redo via zundo)
- **Migrations**: Roster store has versioned migrations in `src/state/roster-building/migrations.ts`

### Data Layer

The app consumes game data from JSON files generated from an Excel spreadsheet:

- **Source**: `data/mesbg_data.xlsx` contains all MESBG models, rules, and army lists
- **Generator**: `data/scripts/main.py` converts Excel → JSON files
- **Output**: `src/assets/data/*.json` files are imported in `src/assets/data.ts`
- **Types**: `src/types/` contains TypeScript definitions for all data structures

Key data types:

- `Unit` - Model stats, options, special rules
- `Roster` - Army list with warbands, metadata, and leader
- `Warband` - Hero + followers structure
- `ArmyListData` - Army composition rules and restrictions
- `Profile` - Model profile card data

### Component Structure

Components follow an atomic design pattern:

- `src/components/atoms/` - Basic reusable components (buttons, icons, badges)
- `src/components/common/` - Complex shared components (rosters, warbands, forms)
- `src/components/modal/` - Modal dialogs
- `src/components/drawer/` - Sidebar drawers
- `src/pages/` - Top-level page components mapped to routes

### Routing

Routes are defined in `src/routing/routes.tsx` using React Router v7:

- `/` - Home page with roster creation
- `/rosters` - List of all rosters
- `/rosters/:groupId` - Grouped rosters
- `/roster/:rosterId` - Roster builder/editor
- `/gamemode/:rosterId` - Digital game trackers
- `/roster/:rosterId/pdf-printable` - Printable roster PDF
- `/match-history` - Game results and statistics
- `/database` - Model database viewer
- `/collection` - Collection management

### Firebase Integration

Firebase is used for user authentication and cloud sync:

- `src/firebase/FirebaseAuthContext.tsx` - Auth provider wrapping the app
- User rosters, match history, and collection can sync to cloud
- Environment variables required: Firebase config in `.env`

### Validation and Business Logic

- `src/components/common/unit-selection/special-hero-selection-rules.ts` - Hero selection constraints
- `src/components/common/unit-selection/special-unit-selection-rules.ts` - Unit selection constraints
- Roster validation occurs via rules defined in `src/assets/data/warning_rules.json`

### Build Configuration

- **Vite config**: `vite.config.ts` defines environment variables:
  - `BUILD_VERSION` - from package.json version
  - `BUILD_DATE` - build timestamp
  - `RESOURCES_URL` - CDN for static resources (profiles, images)
  - `API_URL` - Backend API endpoint
- **Output**: `./build` directory
- **Post-build**: Sitemap generation via `scripts/generate-sitemap.js`

## Development Workflows

### Adding New Models/Data

1. Edit `data/mesbg_data.xlsx`
2. Run `npm run build:data` to regenerate JSON files
3. TypeScript will catch any schema mismatches

### Creating New Components

- Use atomic design principles
- Add Storybook stories for atoms (`.stories.tsx`)
- Follow existing component patterns for MUI integration

### State Updates

- Always use Zustand actions defined in slices
- Persist state is automatic via middleware
- Use temporal store for undo/redo in roster builder

### Pre-commit Hooks

Husky runs `npm run check` (Prettier + ESLint) on every commit. Fix issues before committing.

## Important Notes

- The app is a PWA with offline support via service worker
- All roster data persists to localStorage by default
- External resources (images, profile cards) load from CDN in production
- Match history stores detailed game results including scenario-specific victory points
- Collection feature is opt-in and provides build warnings for models you don't own
