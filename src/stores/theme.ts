import { useLocalStorage } from '@/lib/hooks/use-local-storage';

export const isDarkStore = useLocalStorage('dark', true);
