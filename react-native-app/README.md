# React Native Expo 53 App

A modern React Native application built with Expo SDK 53, TypeScript, and the New Architecture.

## Features

- 🚀 Expo SDK 53 with New Architecture (Fabric + TurboModules)
- 📱 Cross-platform (iOS, Android, Web)
- 🎯 TypeScript for type safety
- 🧭 File-based routing with Expo Router
- 🎨 Themed UI components
- 📦 Zustand for state management
- 🔗 Custom hooks and utilities
- ✅ ESLint and TypeScript configured

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Expo CLI: `npm install -g @expo/cli`
- iOS Simulator (macOS) or Android Studio

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

3. Run on specific platforms:
   ```bash
   npm run ios     # iOS simulator
   npm run android # Android emulator
   npm run web     # Web browser
   ```

## Project Structure

```
src/
├── app/                    # Expo Router pages
│   ├── (tabs)/            # Tab navigation
│   ├── _layout.tsx        # Root layout
│   └── +not-found.tsx     # 404 page
├── components/            # Reusable components
│   ├── ui/               # UI components
│   └── common/           # Common components
├── hooks/                # Custom hooks
├── services/             # API services
├── store/                # State management
├── types/                # TypeScript definitions
├── utils/                # Utility functions
└── constants/            # App constants
```

## Available Scripts

- `npm start` - Start the development server
- `npm run ios` - Run on iOS simulator
- `npm run android` - Run on Android emulator
- `npm run web` - Run in web browser
- `npm test` - Run tests
- `npm run lint` - Lint the code
- `npm run type-check` - Check TypeScript types

## Key Features

### New Architecture
This app is configured to use React Native's New Architecture:
- **Fabric**: New rendering system for better performance
- **TurboModules**: New native modules system
- **Codegen**: Static code generation for type safety

### Expo Router
File-based routing system similar to Next.js:
- Automatic route generation
- Type-safe navigation
- Nested layouts support

### Theming
Built-in light and dark theme support with:
- Automatic system theme detection
- Themed components
- Consistent color scheme

## Development

### Adding New Screens
Create new files in the `src/app/` directory following Expo Router conventions.

### Creating Components
Add reusable components to `src/components/ui/` or `src/components/common/`.

### State Management
Use Zustand stores in `src/store/` for global state management.

### API Integration
Extend the API service in `src/services/api.ts` for backend communication.

## Building for Production

```bash
# Build for Android
npm run build:android

# Build for iOS  
npm run build:ios
```

## Learn More

- [Expo Documentation](https://docs.expo.dev/)
- [React Native New Architecture](https://reactnative.dev/docs/the-new-architecture/landing-page)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [TypeScript for React Native](https://reactnative.dev/docs/typescript)
