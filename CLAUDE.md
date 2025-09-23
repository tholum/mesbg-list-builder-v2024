# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## About the Project

MESBG List Builder (2024 Edition) is a React-based web application for building army lists for the Middle-Earth Strategy Battle Game (MESBG). It's a Progressive Web App (PWA) that includes features like army list creation, digital game trackers, match history, and collection management.

## Development Commands

### Essential Commands

- `npm start` - Start development server
- `npm run build` - Build for production (includes TypeScript compilation)
- `npm run check` - Run prettier and lint checks
- `npm run check:fix` - Auto-fix prettier and lint issues
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Auto-fix ESLint issues
- `npm run prettier` - Check code formatting
- `npm run prettier:fix` - Auto-fix code formatting

### Data Management

- `npm run build:data` - Process game data from Excel files using Python scripts
- `npm run watch:data` - Watch for Excel file changes and rebuild data automatically

### Storybook

- `npm run storybook` - Start Storybook development server
- `npm run build-storybook` - Build Storybook for production

## Architecture Overview

### Frontend Stack

- **React 18** with TypeScript
- **Vite** for build tooling and development
- **Material-UI (MUI)** for UI components
- **React Router** for navigation
- **Zustand** for state management with persistence and undo functionality
- **SCSS** for styling

### State Management

The application uses Zustand with a slice-based architecture located in `src/state/`:

- **Roster Building**: Army list creation and modification
- **Gamemode**: Digital game tracking and statistics
- **Collection**: User inventory management
- **Preferences**: Application settings and themes
- **Recent Games**: Match history storage

State is persisted to localStorage and includes undo/redo functionality via the `zundo` library.

### Key Directories

- `src/pages/` - Main application pages (routes)
- `src/components/` - Reusable UI components organized by feature
- `src/state/` - Zustand store slices and state management
- `src/routing/` - React Router configuration
- `src/theme/` - Material-UI theme customization
- `src/assets/data/` - Processed game data (JSON files)
- `data/` - Source Excel files and Python processing scripts

### Data Processing Pipeline

Game data originates from Excel files in the `data/` directory and is processed by Python scripts (`data/scripts/main.py`) into JSON files that the React application consumes. This allows non-technical users to update game data via spreadsheets.

### Component Architecture

Components follow a hierarchical structure with shared components in `src/components/common/` and feature-specific components organized by domain. The app uses Material-UI's theming system for consistent styling and supports both light and dark modes.

### Build Configuration

- **Vite** handles module bundling and development server
- **TypeScript** with strict configuration
- **ESLint** and **Prettier** for code quality
- **Husky** for git hooks
- Build outputs to `./build` directory
- Resources are served from CDN in production (`https://resources.mesbg-list-builder.com/v2024`)

### Testing

- **Vitest** for unit testing with browser support
- **Storybook** for component development and testing
- **Playwright** for end-to-end testing
