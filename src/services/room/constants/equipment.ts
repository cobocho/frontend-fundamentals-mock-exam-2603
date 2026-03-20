import { Equipment } from '../api/rooms.types';

export const EQUIPMENT_LABELS: Record<Equipment, string> = {
  tv: 'TV',
  whiteboard: '화이트보드',
  video: '화상장비',
  speaker: '스피커',
};

export const EQUIPMENT_OPTIONS: Array<{ label: string; value: Equipment }> = Object.keys(EQUIPMENT_LABELS).map(key => {
  const equipment = key as Equipment;
  return {
    label: EQUIPMENT_LABELS[equipment],
    value: equipment,
  };
});
