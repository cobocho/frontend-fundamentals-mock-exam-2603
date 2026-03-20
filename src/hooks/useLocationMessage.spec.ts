import { describe, test, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocationMessage } from './useLocationMessage';

const mockLocation = { state: null as { message?: string } | null, pathname: '/', search: '', hash: '', key: '' };

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

  test('location state에 message가 있으면 해당 문자열을 반환한다', () => {
    mockLocation.state = { message: '예약이 완료되었습니다.' };

    const { result } = renderHook(() => useLocationMessage());

    expect(result.current.locationMessage).toBe('예약이 완료되었습니다.');
  });

  test('location state에 message가 있으면 history.replaceState를 호출한다', () => {
    mockLocation.state = { message: '예약이 완료되었습니다.' };

    renderHook(() => useLocationMessage());

    expect(window.history.replaceState).toHaveBeenCalledWith({}, '');
  });

  test('setLocationMessage로 메시지를 변경할 수 있다', () => {
    const { result } = renderHook(() => useLocationMessage());

    act(() => {
      result.current.setLocationMessage('오류가 발생했습니다.');
    });

    expect(result.current.locationMessage).toBe('오류가 발생했습니다.');
  });

  test('setLocationMessage로 메시지를 null로 초기화할 수 있다', () => {
    mockLocation.state = { message: '예약이 완료되었습니다.' };

    const { result } = renderHook(() => useLocationMessage());

    act(() => {
      result.current.setLocationMessage(null);
    });

    expect(result.current.locationMessage).toBeNull();
  });
});
