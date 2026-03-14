const API_BASE = '/api';

export async function uploadPdf(
  endpoint: string,
  files: File[],
  options?: Record<string, string>
): Promise<Blob> {
  const formData = new FormData();
  
  for (const file of files) {
    formData.append('files', file);
  }
  
  if (options) {
    for (const [key, value] of Object.entries(options)) {
      formData.append(key, value);
    }
  }
  
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || `API error: ${response.statusText}`);
  }
  
  return response.blob();
}

export async function uploadImages(endpoint: string, files: File[]): Promise<Blob> {
  const formData = new FormData();
  
  for (const file of files) {
    formData.append('files', file);
  }
  
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || `API error: ${response.statusText}`);
  }
  
  return response.blob();
}

export async function getThumbnails(file: File): Promise<string[]> {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`${API_BASE}/preview`, {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || `API error: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.thumbnails || [];
}

export async function splitPdf(file: File, mode: 'all' | 'ranges', ranges?: string): Promise<Blob> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('mode', mode);
  if (mode === 'ranges' && ranges) {
    formData.append('ranges', ranges);
  }

  const response = await fetch(`${API_BASE}/split`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || `API error: ${response.statusText}`);
  }

  return response.blob();
}
