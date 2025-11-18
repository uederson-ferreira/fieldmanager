/**
 * Utilitários para manipulação de datas com fuso horário local
 */

/**
 * Obtém a data atual no fuso horário local (formato YYYY-MM-DD)
 */
export function getCurrentDateLocal(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Obtém a hora atual no fuso horário local (formato HH:MM)
 */
export function getCurrentTimeLocal(): string {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Obtém data e hora atuais no fuso horário local
 */
export function getCurrentDateTimeLocal(): { data: string; hora: string } {
  return {
    data: getCurrentDateLocal(),
    hora: getCurrentTimeLocal()
  };
}

/**
 * Converte data UTC para fuso horário local
 */
export function convertUTCToLocal(utcDate: string): string {
  const date = new Date(utcDate);
  return date.toLocaleDateString('pt-BR');
}

/**
 * Converte hora UTC para fuso horário local
 */
export function convertUTCTimeToLocal(utcTime: string): string {
  // Assumindo que utcTime está no formato HH:MM
  const [hours, minutes] = utcTime.split(':').map(Number);
  const date = new Date();
  date.setUTCHours(hours, minutes);
  
  const localHours = String(date.getHours()).padStart(2, '0');
  const localMinutes = String(date.getMinutes()).padStart(2, '0');
  return `${localHours}:${localMinutes}`;
}

/**
 * Formata data para exibição no formato brasileiro
 */
export function formatDateForDisplay(date: string): string {
  return new Date(date).toLocaleDateString('pt-BR');
}

/**
 * Formata hora para exibição
 */
export function formatTimeForDisplay(time: string): string {
  return time; // Já está no formato HH:MM
} 