interface TimeOption {
  hour: number;
  minute: number;
  label: string;
}

export function parseTimeToMinutes(time: string): number {
  const [hour, minute] = time.split(':').map(Number);
  return hour * 60 + minute;
}

export function formatTimeLabel(hour: number, minute: number): string {
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
}

export const getTimeOptions = (startTime: string, endTime: string, timeStep: number): TimeOption[] => {
  const start = parseTimeToMinutes(startTime);
  const end = parseTimeToMinutes(endTime);
  const options: TimeOption[] = [];

  for (let minutes = start; minutes <= end; minutes += timeStep) {
    const hour = Math.floor(minutes / 60);
    const minute = minutes % 60;
    options.push({ hour, minute, label: formatTimeLabel(hour, minute) });
  }

  return options;
};

export const isBeforeThan = (time: string, targetTime: string): boolean => {
  return parseTimeToMinutes(time) < parseTimeToMinutes(targetTime);
};
