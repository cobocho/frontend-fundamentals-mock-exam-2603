import { describe, test, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useLocationMessage } from './useLocationMessage';

const mockLocation = { state: null as { text?: string; type?: 'success' | 'error' } | null, pathname: '/', search: '', hash: '', key: '' };

vi.mock('react-router-dom', () => ({
  useLocation: () => mockLocation,
}));

describe('useLocationMessage', () => {
  beforeEach(() => {
    mockLocation.state = null;
    vi.spyOn(window.history, 'replaceState').mockImplementation(() => {});
  });

  test('location state에 message가 없으면 null을 반환한다', () => {
    const { result } = renderHook(() => useLocationMessage());

    expect(result.current.locationMessage).toBeNull();
  });

  test('location state에 text가 있으면 LocationMessage 객체를 반환한다', () => {
    mockLocation.state = { text: '예약이 완료되었습니다.', type: 'success' };

    const { result } = renderHook(() => useLocationMessage());

    expect(result.current.locationMessage).toEqual({
      text: '예약이 완료되었습니다.',
      type: 'success',
    });
  });

  test('location state에 text가 있으면 history.replaceState를 호출한다', () => {
    mockLocation.state = { text: '예약이 완료되었습니다.', type: 'success' };

    renderHook(() => useLocationMessage());

    expect(window.history.replaceState).toHaveBeenCalledWith({}, '');
  });

  test('createLocationMessage로 navigate state 객체를 생성할 수 있다', () => {
    const { result } = renderHook(() => useLocationMessage());

    const message = result.current.createLocationMessage('error', '오류가 발생했습니다.');

    expect(message).toEqual({ text: '오류가 발생했습니다.', type: 'error' });
  });

  test('type을 지정하지 않으면 기본값 success로 설정된다', () => {
    mockLocation.state = { text: '예약이 완료되었습니다.' };

    const { result } = renderHook(() => useLocationMessage());

    expect(result.current.locationMessage).toEqual({
      text: '예약이 완료되었습니다.',
      type: 'success',
    });
  });
});
