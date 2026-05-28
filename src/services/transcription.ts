import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { uploadAsync, FileSystemUploadType } from 'expo-file-system/legacy';

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

  if (!OPENAI_API_KEY) {
    debug.error = 'OpenAI API key not configured';
    return { ok: false, error: debug.error ?? 'Unknown error', debug };
  }

  // Check file exists and get size
  try {
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    debug.fileExists = fileInfo.exists;
    if (fileInfo.exists && 'size' in fileInfo) {
      debug.fileSize = fileInfo.size ?? null;
    }
    if (!fileInfo.exists) {
      debug.error = 'Audio file does not exist at URI';
      return { ok: false, error: debug.error ?? 'Unknown error', debug };
    }

    if (debug.fileSize !== null && debug.fileSize === 0) {
      debug.error = 'Audio file is empty (0 bytes)';
      return { ok: false, error: debug.error ?? 'Unknown error', debug };
    }
  } catch {
    // File info check not critical — continue with transcription
  }

  try {
    let responseText: string;
    let statusCode: number;

    if (Platform.OS === 'web') {
      // Web: use fetch + blob (works fine)
      debug.mimeType = 'audio/webm';
      const formData = new FormData();
      const fileResponse = await fetch(fileUri);
      const blob = await fileResponse.blob();
      debug.fileSize = blob.size;
      formData.append('file', blob, 'recording.webm');
      formData.append('model', 'whisper-1');
      formData.append('language', 'en');

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
        body: formData,
      });

      statusCode = response.status;
      responseText = await response.text();
    } else {
      // Native (iOS/Android): use FileSystem.uploadAsync to avoid FormData issues
      debug.mimeType = 'audio/mp4';
      const uploadResult = await uploadAsync(
        'https://api.openai.com/v1/audio/transcriptions',
        fileUri,
        {
          httpMethod: 'POST',
          uploadType: FileSystemUploadType.MULTIPART,
          fieldName: 'file',
          mimeType: 'audio/mp4',
          parameters: { model: 'whisper-1', language: 'en' },
          headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
        },
      );

      statusCode = uploadResult.status;
      responseText = uploadResult.body;
    }

    debug.whisperStatus = statusCode;
    debug.whisperResponseRaw = responseText;

    if (statusCode < 200 || statusCode >= 300) {
      debug.error = `Transcription failed (${statusCode}): ${responseText}`;
      return { ok: false, error: debug.error ?? 'Unknown error', debug };
    }

    let data: any;
    try {
      data = JSON.parse(responseText);
    } catch {
      debug.error = `Failed to parse Whisper response as JSON: ${responseText.substring(0, 200)}`;
      return { ok: false, error: debug.error ?? 'Unknown error', debug };
    }

    const transcript = data.text ?? '';
    debug.rawTranscript = transcript;
    debug.wordCount = transcript.split(/\s+/).filter(Boolean).length;

    return { ok: true, text: transcript, debug };
  } catch (e: any) {
    debug.error = e.message ?? 'Network error during transcription';
    return { ok: false, error: debug.error ?? 'Unknown error', debug };
  }
}
