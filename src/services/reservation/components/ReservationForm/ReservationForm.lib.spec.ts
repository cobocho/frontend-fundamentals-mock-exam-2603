import { describe, test, expect } from 'vitest';
import {
  parseTimeToMinutes,
  formatTimeLabel,
  getTimeOptions,
  isBeforeThan,
} from './ReservationForm.lib';

describe('parseTimeToMinutes', () => {
  test('시간을 분 단위로 변환한다', () => {
    expect(parseTimeToMinutes('00:00')).toBe(0);
    expect(parseTimeToMinutes('01:00')).toBe(60);
    expect(parseTimeToMinutes('09:30')).toBe(570);
    expect(parseTimeToMinutes('23:59')).toBe(1439);
  });
});

describe('formatTimeLabel', () => {
  test('한 자리 숫자에 0을 채워 두 자리로 포맷한다', () => {
    expect(formatTimeLabel(8, 0)).toBe('08:00');
    expect(formatTimeLabel(9, 5)).toBe('09:05');
  });

  test('두 자리 숫자는 그대로 포맷한다', () => {
    expect(formatTimeLabel(14, 30)).toBe('14:30');
    expect(formatTimeLabel(23, 59)).toBe('23:59');
  });
});

describe('getTimeOptions', () => {
  test('30분 간격으로 시간 옵션을 생성한다', () => {
    const options = getTimeOptions('09:00', '11:00', 30);

    expect(options).toEqual([
      { hour: 9, minute: 0, label: '09:00' },
      { hour: 9, minute: 30, label: '09:30' },
      { hour: 10, minute: 0, label: '10:00' },
      { hour: 10, minute: 30, label: '10:30' },
      { hour: 11, minute: 0, label: '11:00' },
    ]);
  });

  test('60분 간격으로 시간 옵션을 생성한다', () => {
    const options = getTimeOptions('09:00', '12:00', 60);

    expect(options).toEqual([
      { hour: 9, minute: 0, label: '09:00' },
      { hour: 10, minute: 0, label: '10:00' },
      { hour: 11, minute: 0, label: '11:00' },
      { hour: 12, minute: 0, label: '12:00' },
    ]);
  });

  test('15분 간격으로 시간 옵션을 생성한다', () => {
    const options = getTimeOptions('14:00', '15:00', 15);

    expect(options).toEqual([
      { hour: 14, minute: 0, label: '14:00' },
      { hour: 14, minute: 15, label: '14:15' },
      { hour: 14, minute: 30, label: '14:30' },
      { hour: 14, minute: 45, label: '14:45' },
      { hour: 15, minute: 0, label: '15:00' },
    ]);
  });

  test('시작 시간과 종료 시간이 같으면 하나의 옵션만 반환한다', () => {
    const options = getTimeOptions('09:00', '09:00', 30);

    expect(options).toEqual([{ hour: 9, minute: 0, label: '09:00' }]);
  });

  test('종료 시간이 step에 딱 맞지 않으면 종료 시간을 넘지 않는다', () => {
    const options = getTimeOptions('09:00', '10:20', 30);

    expect(options).toEqual([
      { hour: 9, minute: 0, label: '09:00' },
      { hour: 9, minute: 30, label: '09:30' },
      { hour: 10, minute: 0, label: '10:00' },
    ]);
  });
});

describe('isBeforeThan', () => {
  test('앞선 시간이면 true를 반환한다', () => {
    expect(isBeforeThan('09:00', '10:00')).toBe(true);
  });

  test('같은 시간이면 false를 반환한다', () => {
    expect(isBeforeThan('09:00', '09:00')).toBe(false);
  });

  test('늦은 시간이면 false를 반환한다', () => {
    expect(isBeforeThan('11:00', '10:00')).toBe(false);
  });

  test('분 단위 비교가 올바르게 동작한다', () => {
    expect(isBeforeThan('09:30', '09:31')).toBe(true);
    expect(isBeforeThan('09:31', '09:30')).toBe(false);
  });
});
