import { OPENAI_API_KEY } from '@/src/constants/config';

export type TranscriptionResult =
  | { ok: true; text: string }
  | { ok: false; error: string };

export async function transcribeAudio(fileUri: string): Promise<TranscriptionResult> {
  if (!OPENAI_API_KEY) {
    return { ok: false, error: 'OpenAI API key not configured' };
  }

  const formData = new FormData();
  formData.append('file', {
    uri: fileUri,
    type: 'audio/m4a',
    name: 'recording.m4a',
  } as any);
  formData.append('model', 'whisper-1');

  try {
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const body = await response.text();
      return { ok: false, error: `Transcription failed (${response.status}): ${body}` };
    }

    const data = await response.json();
    return { ok: true, text: data.text };
  } catch (e: any) {
    return { ok: false, error: e.message ?? 'Network error during transcription' };
  }
}
