import { useColorScheme as useRNColorScheme } from 'react-native';

// Since React Native 0.82 the scheme is 'unspecified' instead of null when the
// platform has no preference, so anything but 'dark' falls back to 'light'.
export function useColorScheme(): 'light' | 'dark' {
  return useRNColorScheme() === 'dark' ? 'dark' : 'light';
}
