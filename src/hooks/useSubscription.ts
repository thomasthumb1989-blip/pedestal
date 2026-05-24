import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUBSCRIPTION_KEY = '@pedestal_subscribed';

export function useSubscription() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(SUBSCRIPTION_KEY).then((value) => {
      setIsSubscribed(value === 'true');
      setIsLoading(false);
    });
  }, []);

  const subscribe = useCallback(async () => {
    await AsyncStorage.setItem(SUBSCRIPTION_KEY, 'true');
    setIsSubscribed(true);
  }, []);

  const clearSubscription = useCallback(async () => {
    await AsyncStorage.removeItem(SUBSCRIPTION_KEY);
    setIsSubscribed(false);
  }, []);

  return { isSubscribed, isLoading, subscribe, clearSubscription };
}
