/**
 * Utilitários para manipulação de datas no backend
 * Garante que as datas sejam salvas no fuso horário local
 */

/**
 * Retorna a data atual no fuso horário local
 * @returns Data no formato YYYY-MM-DD
 */
export function getCurrentDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Retorna a hora atual no fuso horário local
 * @returns Hora no formato HH:MM
 */
export function getCurrentTime(): string {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Retorna data e hora atual no fuso horário local
 * @returns Data e hora no formato YYYY-MM-DD HH:MM:SS
 */
export function getCurrentDateTime(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * Retorna timestamp ISO no fuso horário local
 * @returns Timestamp no formato ISO string
 */
export function getCurrentTimestamp(): string {
  const now = new Date();
  // Ajustar para fuso horário local
  const offset = now.getTimezoneOffset() * 60000; // offset em milissegundos
  const localDate = new Date(now.getTime() - offset);
  return localDate.toISOString();
} 