# React Native Expo 53 Project - Claude Context

## Project Overview
This is a React Native application built with Expo SDK 53, TypeScript, and the New Architecture (Fabric renderer and TurboModules). The project targets modern React Native development practices and leverages the latest Expo features.

## Tech Stack
- **React Native**: 0.74+ (with New Architecture enabled)
- **Expo SDK**: 53
- **TypeScript**: Latest stable version
- **Architecture**: New Architecture (Fabric + TurboModules)
- **Navigation**: Expo Router (file-based routing)
- **Styling**: StyleSheet, possibly Tamagui or NativeWind
- **State Management**: Zustand/Redux Toolkit (to be determined)
- **Testing**: Jest, React Native Testing Library, Detox (E2E)

## Key Dependencies (Expected)
```json
{
  "expo": "~53.0.0",
  "react": "18.2.0",
  "react-native": "0.74.0",
  "expo-router": "~4.0.0",
  "@expo/vector-icons": "^14.0.0",
  "expo-font": "~12.0.0",
  "expo-linking": "~6.3.0",
  "expo-splash-screen": "~0.27.0",
  "expo-status-bar": "~1.12.0",
  "expo-system-ui": "~3.0.0",
  "expo-web-browser": "~13.0.0"
}
```

## New Architecture Configuration
The project uses React Native's New Architecture:
- **Fabric**: New rendering system
- **TurboModules**: New native modules system
- **Codegen**: Static code generation for type safety

### Key New Architecture Features:
1. Improved performance and memory usage
2. Better type safety between JS and native code
3. Simplified threading model
4. Enhanced developer experience

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
├── types/                # TypeScript type definitions
├── utils/                # Utility functions
└── constants/            # App constants
```

## Development Guidelines

### TypeScript Best Practices
- Use strict mode TypeScript configuration
- Define proper types for all props and function parameters
- Use React Native's built-in types (ViewStyle, TextStyle, etc.)
- Leverage Expo's typed APIs
- Use generic types for reusable components

### Component Patterns
- Prefer functional components with hooks
- Use React.memo() for performance optimization
- Follow React Native's naming conventions
- Use TypeScript interfaces for prop types
- Implement proper error boundaries

### Performance Considerations
- Leverage New Architecture performance benefits
- Use React.useMemo and React.useCallback appropriately
- Implement proper list optimization (FlashList/FlatList)
- Optimize image loading and caching
- Use Hermes JavaScript engine features

### Styling Guidelines
- Use StyleSheet.create() for styles
- Implement responsive design principles
- Follow React Native's flexbox model
- Use consistent spacing and typography
- Consider dark mode support

## Expo Router (File-based Routing)
- Use app directory structure for routing
- Implement proper navigation types
- Use layout components for shared UI
- Handle deep linking appropriately
- Implement proper error boundaries for routes

## Testing Strategy
- Unit tests for utilities and hooks
- Component tests for UI components
- Integration tests for screens
- E2E tests for critical user flows
- Test New Architecture specific features

## Development Commands
```bash
# Start development server
npx expo start

# Start with specific platform
npx expo start --ios
npx expo start --android

# Build for development
npx expo run:ios
npx expo run:android

# Type checking
npx tsc --noEmit

# Testing
npm test
npm run test:e2e

# Linting
npm run lint
```

## Common Patterns and Examples

### Component with TypeScript
```typescript
interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({ title, onPress, variant = 'primary', disabled = false }) => {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.button, styles[variant], disabled && styles.disabled]}
    >
      <Text style={[styles.text, styles[`${variant}Text`]]}>{title}</Text>
    </Pressable>
  );
};
```

### Custom Hook Pattern
```typescript
interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

const useApi = <T>(url: string): UseApiResult<T> => {
  // Implementation
};
```

### Screen Component with Expo Router
```typescript
import { Stack } from 'expo-router';

export default function ProfileScreen() {
  return (
    <>
      <Stack.Screen 
        options={{
          title: 'Profile',
          headerRight: () => <HeaderButton />,
        }} 
      />
      <View style={styles.container}>
        {/* Screen content */}
      </View>
    </>
  );
}
```

## Troubleshooting Common Issues

### New Architecture Issues
- Ensure all native modules are compatible with New Architecture
- Check for TurboModule implementations
- Verify Fabric component compatibility
- Update bridging code if necessary

### Expo Router Issues
- Check file naming conventions
- Verify layout structure
- Ensure proper navigation types
- Check deep linking configuration

### TypeScript Issues
- Update type definitions regularly
- Use proper React Native types
- Check Expo SDK type compatibility
- Verify custom module types

## Performance Optimization
- Use Hermes JavaScript engine
- Implement proper bundle splitting
- Optimize image assets
- Use native modules when appropriate
- Leverage New Architecture benefits

## Deployment Considerations
- Configure app.json/app.config.js properly
- Set up proper build variants
- Configure EAS Build if needed
- Test on both iOS and Android
- Verify New Architecture compatibility in production

## Recent Updates and Best Practices (August 2025)
- Expo SDK 53 includes latest React Native 0.74
- New Architecture is now stable and recommended
- Expo Router has matured significantly
- Better TypeScript integration
- Improved development tools and debugging
- Enhanced performance with Fabric renderer

## Notes for Claude
When helping with this project:
1. Always consider New Architecture implications
2. Use TypeScript types consistently
3. Follow Expo Router patterns
4. Suggest performance optimizations
5. Keep up with latest Expo/React Native patterns
6. Consider mobile-first design principles
7. Implement proper error handling
8. Use modern React patterns (hooks, context)
9. Consider accessibility best practices
10. Suggest testing strategies for components and features

## Useful Resources
- [Expo SDK 53 Documentation](https://docs.expo.dev/)
- [React Native New Architecture](https://reactnative.dev/docs/the-new-architecture/landing-page)
- [Expo Router Documentation](https://docs.expo.dev/router/introduction/)
- [React Native TypeScript](https://reactnative.dev/docs/typescript)
- [Performance Best Practices](https://reactnative.dev/docs/performance)
