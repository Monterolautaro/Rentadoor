export function sanitizeFileName(fileName: string): string {
  return fileName
    .normalize('NFD') // Elimina acentos
    .replace(/[^a-zA-Z0-9.\-_]/g, '_') // Solo letras, números, punto, guion y guion bajo
    .replace(/\s+/g, '_'); // Reemplaza espacios por guion bajo
} 