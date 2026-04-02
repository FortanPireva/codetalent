import * as SecureStore from "expo-secure-store";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";
const UPLOAD_TIMEOUT = 30_000; // 30s for file uploads

interface UploadFile {
  uri: string;
  type: string;
  name: string;
}

interface UploadOptions {
  endpoint: string;
  file: UploadFile;
  extraFields?: Record<string, string>;
}

export async function uploadFile<T = Record<string, unknown>>({
  endpoint,
  file,
  extraFields,
}: UploadOptions): Promise<T> {
  const token = await SecureStore.getItemAsync("auth_token");

  const formData = new FormData();
  formData.append("file", {
    uri: file.uri,
    type: file.type,
    name: file.name,
  } as unknown as Blob);

  if (extraFields) {
    for (const [key, value] of Object.entries(extraFields)) {
      formData.append(key, value);
    }
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), UPLOAD_TIMEOUT);

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
      signal: controller.signal,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error((err as { error?: string }).error || "Upload failed");
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Upload timed out. Please try again.");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
