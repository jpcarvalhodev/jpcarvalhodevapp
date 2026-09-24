export const truncate = (text?: string | null, limit = 0) => {
  if (!text) return "";
  if (limit <= 0) return text;
  return text.length > limit ? `${text.substring(0, limit)}...` : text;
};

export const toImageUri = (photo?: string | null): string | null => {
  if (!photo) return null;
  if (photo.startsWith("data:image") || /^https?:\/\//i.test(photo)) return photo;
  return `data:image/jpeg;base64,${photo}`;
};
