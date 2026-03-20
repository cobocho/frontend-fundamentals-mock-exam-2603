export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export function timeToMinutes(time: string, timelineStart: number = 9): number {
  const [h, m] = time.split(':').map(Number);
  return (h - timelineStart) * 60 + m;
}
