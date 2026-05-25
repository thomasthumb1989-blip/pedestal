import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';

import { OPENAI_API_KEY } from '@/src/constants/config';

export type TranscriptionDebug = {
  apiKeyPresent: boolean;
  apiKeyLength: number;
  fileUri: string;
  fileSize: number | null;
  fileExists: boolean | null;
  mimeType: string;
  whisperStatus: number | null;
  whisperResponseRaw: string | null;
  rawTranscript: string | null;
  wordCount: number;
  error: string | null;
};

export type TranscriptionResult =
  | { ok: true; text: string; debug: TranscriptionDebug }
  | { ok: false; error: string; debug: TranscriptionDebug };

export async function transcribeAudio(fileUri: string): Promise<TranscriptionResult> {
  const debug: TranscriptionDebug = {
    apiKeyPresent: !!OPENAI_API_KEY,
    apiKeyLength: OPENAI_API_KEY.length,
    fileUri,
    fileSize: null,
    fileExists: null,
    mimeType: '',
    whisperStatus: null,
    whisperResponseRaw: null,
    rawTranscript: null,
    wordCount: 0,
    error: null,
  };

  console.log('[TRANSCRIBE] === Starting transcription ===');
  console.log('[TRANSCRIBE] API key present:', debug.apiKeyPresent, '| length:', debug.apiKeyLength);
  console.log('[TRANSCRIBE] File URI:', fileUri);

  if (!OPENAI_API_KEY) {
    debug.error = 'OpenAI API key not configured';
    console.log('[TRANSCRIBE] ERROR: No API key');
    return { ok: false, error: debug.error ?? 'Unknown error', debug };
  }

  // Check file exists and get size
  try {
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    debug.fileExists = fileInfo.exists;
    if (fileInfo.exists && 'size' in fileInfo) {
      debug.fileSize = fileInfo.size ?? null;
    }
    console.log('[TRANSCRIBE] File exists:', fileInfo.exists, '| size:', debug.fileSize, 'bytes');

    if (!fileInfo.exists) {
      debug.error = 'Audio file does not exist at URI';
      console.log('[TRANSCRIBE] ERROR: File not found');
      return { ok: false, error: debug.error ?? 'Unknown error', debug };
    }

    if (debug.fileSize !== null && debug.fileSize === 0) {
      debug.error = 'Audio file is empty (0 bytes)';
      console.log('[TRANSCRIBE] ERROR: File is empty');
      return { ok: false, error: debug.error ?? 'Unknown error', debug };
    }
  } catch (e: any) {
    console.log('[TRANSCRIBE] WARNING: Could not check file info:', e.message);
  }

  const formData = new FormData();

  if (Platform.OS === 'web') {
    debug.mimeType = 'audio/webm';
    console.log('[TRANSCRIBE] Fetching blob from URI...');
    const fileResponse = await fetch(fileUri);
    const blob = await fileResponse.blob();
    debug.fileSize = blob.size;
    console.log('[TRANSCRIBE] Blob size:', blob.size, 'bytes | type:', blob.type);

    // Detect suspiciously small blobs (likely silent/empty recording)
    if (blob.size < 1000) {
      debug.error = `Recording appears silent — blob only ${blob.size} bytes. Check microphone permission.`;
      console.log('[TRANSCRIBE] ERROR: Blob too small, likely silent');
      return { ok: false, error: debug.error ?? 'Unknown error', debug };
    }

    formData.append('file', blob, 'recording.webm');
  } else {
    // Use audio/mp4 (correct MIME for m4a) instead of audio/m4a
    debug.mimeType = 'audio/mp4';
    formData.append('file', {
      uri: fileUri,
      type: 'audio/mp4',
      name: 'recording.m4a',
    } as any);
  }

  formData.append('model', 'whisper-1');
  formData.append('language', 'en');

  console.log('[TRANSCRIBE] MIME type:', debug.mimeType);
  console.log('[TRANSCRIBE] Sending to Whisper API...');

  try {
    const startTime = Date.now();
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: formData,
    });
    const elapsed = Date.now() - startTime;

    debug.whisperStatus = response.status;
    console.log('[TRANSCRIBE] Whisper response status:', response.status, '| took:', elapsed, 'ms');

    const responseText = await response.text();
    debug.whisperResponseRaw = responseText;
    console.log('[TRANSCRIBE] Whisper raw response:', responseText.substring(0, 500));

    if (!response.ok) {
      debug.error = `Transcription failed (${response.status}): ${responseText}`;
      console.log('[TRANSCRIBE] ERROR: API returned non-OK status');
      return { ok: false, error: debug.error ?? 'Unknown error', debug };
    }

    let data: any;
    try {
      data = JSON.parse(responseText);
    } catch {
      debug.error = `Failed to parse Whisper response as JSON: ${responseText.substring(0, 200)}`;
      console.log('[TRANSCRIBE] ERROR: JSON parse failed');
      return { ok: false, error: debug.error ?? 'Unknown error', debug };
    }

    const transcript = data.text ?? '';
    debug.rawTranscript = transcript;
    debug.wordCount = transcript.split(/\s+/).filter(Boolean).length;

    console.log('[TRANSCRIBE] Transcript:', transcript);
    console.log('[TRANSCRIBE] Word count:', debug.wordCount);
    console.log('[TRANSCRIBE] === Transcription complete ===');

    return { ok: true, text: transcript, debug };
  } catch (e: any) {
    debug.error = e.message ?? 'Network error during transcription';
    console.log('[TRANSCRIBE] ERROR: Exception:', e.message);
    console.log('[TRANSCRIBE] Stack:', e.stack);
    return { ok: false, error: debug.error ?? 'Unknown error', debug };
  }
}
