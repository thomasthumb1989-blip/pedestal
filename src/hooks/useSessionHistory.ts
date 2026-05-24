import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SESSIONS_KEY = '@pedestal_sessions';

export type Session = {
  id: string;
  date: string;
  durationSeconds: number;
  clarityScore: number;
  wordsPerMinute: number;
  fillerCount: number;
  fillerPercentage: number;
  totalWords: number;
  transcript: string;
  impromptu?: boolean;
  topic?: string;
};

export function useSessionHistory() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSessions = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(SESSIONS_KEY);
      if (raw) {
        setSessions(JSON.parse(raw));
      }
    } catch {
      // silent — empty sessions is fine
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const saveSession = useCallback(async (session: Omit<Session, 'id' | 'date'>) => {
    const newSession: Session = {
      ...session,
      id: Date.now().toString(),
      date: new Date().toISOString(),
    };

    const updated = [newSession, ...sessions];
    setSessions(updated);
    await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(updated));
    return newSession;
  }, [sessions]);

  return { sessions, loading, saveSession, reload: loadSessions };
}
