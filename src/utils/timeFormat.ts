/**
 * Formata segundos para formato de exibição de tempo (HH:MM:SS ou MM:SS)
 * @param seconds Tempo em segundos
 * @returns String formatada no formato HH:MM:SS ou MM:SS
 */
export function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) {
    return '00:00';
  }
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  // Formatar com padding de zeros
  const paddedMinutes = minutes.toString().padStart(2, '0');
  const paddedSeconds = remainingSeconds.toString().padStart(2, '0');
  
  // Incluir horas apenas se houver
  if (hours > 0) {
    const paddedHours = hours.toString().padStart(2, '0');
    return `${paddedHours}:${paddedMinutes}:${paddedSeconds}`;
  }
  
  return `${paddedMinutes}:${paddedSeconds}`;
}

/**
 * Converte formato de tempo "HH:MM:SS" ou "MM:SS" para segundos
 * @param timeString String no formato "HH:MM:SS" ou "MM:SS"
 * @returns Número de segundos
 */
export function parseTimeToSeconds(timeString: string): number {
  if (!timeString) return 0;
  
  const parts = timeString.split(':').map(part => parseInt(part, 10));
  
  if (parts.length === 3) {
    // Formato HH:MM:SS
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    // Formato MM:SS
    return parts[0] * 60 + parts[1];
  }
  
  return 0;
}

/**
 * Formata segundos para texto descritivo (ex: "2 horas e 30 minutos")
 * @param seconds Tempo em segundos
 * @returns String formatada em texto descritivo
 */
export function formatDurationText(seconds: number): string {
  if (isNaN(seconds) || seconds <= 0) {
    return '0 minutos';
  }
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  let result = '';
  
  if (hours > 0) {
    result += `${hours} ${hours === 1 ? 'hora' : 'horas'}`;
    if (minutes > 0) {
      result += ` e ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`;
    }
  } else if (minutes > 0) {
    result += `${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`;
  } else {
    result = 'menos de 1 minuto';
  }
  
  return result;
} 