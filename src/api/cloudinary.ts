const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export function isCloudinaryConfigured(): boolean {
  return Boolean(cloudName && uploadPreset);
}

export async function uploadToCloudinary(file: File): Promise<string> {
  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary is not configured (VITE_CLOUDINARY_CLOUD_NAME/VITE_CLOUDINARY_UPLOAD_PRESET)');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Cloudinary upload failed');
  }

  const data: { secure_url: string } = await response.json();
  return data.secure_url;
}
