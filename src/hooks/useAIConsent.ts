import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AI_CONSENT_KEY = '@pedestal_ai_consent';

export function useAIConsent() {
  const [hasConsent, setHasConsent] = useState<boolean | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(AI_CONSENT_KEY).then((value) => {
      setHasConsent(value === 'true');
    });
  }, []);

  const grantConsent = useCallback(async () => {
    await AsyncStorage.setItem(AI_CONSENT_KEY, 'true');
    setHasConsent(true);
    setShowModal(false);
  }, []);

  const revokeConsent = useCallback(async () => {
    await AsyncStorage.removeItem(AI_CONSENT_KEY);
    setHasConsent(false);
    setShowModal(false);
  }, []);

  /** Call before recording. Returns true if consent granted, false if modal shown. */
  const requireConsent = useCallback((): boolean => {
    if (hasConsent) return true;
    setShowModal(true);
    return false;
  }, [hasConsent]);

  return { hasConsent, showModal, setShowModal, grantConsent, revokeConsent, requireConsent };
}
