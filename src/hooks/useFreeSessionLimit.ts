import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { STORAGE_KEYS } from '@/src/constants/storageKeys';

export const FREE_SESSION_LIMIT = 3;

export function useFreeSessionLimit() {
  const [sessionCount, setSessionCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEYS.FREE_SESSION_COUNT).then((value) => {
      setSessionCount(value ? parseInt(value, 10) : 0);
      setIsLoading(false);
    });
  }, []);

  const incrementSessionCount = useCallback(async () => {
    const current = await AsyncStorage.getItem(STORAGE_KEYS.FREE_SESSION_COUNT);
    const newCount = (current ? parseInt(current, 10) : 0) + 1;
    await AsyncStorage.setItem(STORAGE_KEYS.FREE_SESSION_COUNT, newCount.toString());
    setSessionCount(newCount);
  }, []);

  const hasReachedLimit = sessionCount >= FREE_SESSION_LIMIT;

  return { sessionCount, hasReachedLimit, incrementSessionCount, isLoading };
}
