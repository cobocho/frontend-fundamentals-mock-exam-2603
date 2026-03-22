import { describe, test, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
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

    expect(result.current.message).toBeNull();
  });

  test('location state에 text가 있으면 LocationMessage 객체를 반환한다', () => {
    mockLocation.state = { text: '예약이 완료되었습니다.', type: 'success' };

    const { result } = renderHook(() => useLocationMessage());

    expect(result.current.message).toEqual({
      text: '예약이 완료되었습니다.',
      type: 'success',
    });
  });

  test('location state에 text가 있으면 history.replaceState를 호출한다', () => {
    mockLocation.state = { text: '예약이 완료되었습니다.', type: 'success' };

    renderHook(() => useLocationMessage());

    expect(window.history.replaceState).toHaveBeenCalledWith({}, '');
  });

  test('setErrorMessage로 에러 메시지를 설정할 수 있다', () => {
    const { result } = renderHook(() => useLocationMessage());

    act(() => {
      result.current.setErrorMessage('오류가 발생했습니다.');
    });

    expect(result.current.message).toEqual({ text: '오류가 발생했습니다.', type: 'error' });
  });

  test('setSuccessMessage로 성공 메시지를 설정할 수 있다', () => {
    const { result } = renderHook(() => useLocationMessage());

    act(() => {
      result.current.setSuccessMessage('예약이 완료되었습니다!');
    });

    expect(result.current.message).toEqual({ text: '예약이 완료되었습니다!', type: 'success' });
  });

  test('createMessage로 navigate state 객체를 생성할 수 있다', () => {
    const { result } = renderHook(() => useLocationMessage());

    const msg = result.current.createMessage('success', '예약 완료!');

    expect(msg).toEqual({ text: '예약 완료!', type: 'success' });
    // createMessage는 로컬 state를 변경하지 않는다
    expect(result.current.message).toBeNull();
  });

  test('clearMessage로 메시지를 초기화할 수 있다', () => {
    mockLocation.state = { text: '예약이 완료되었습니다.', type: 'success' };

    const { result } = renderHook(() => useLocationMessage());

    act(() => {
      result.current.clearMessage();
    });

    expect(result.current.message).toBeNull();
  });

  test('type을 지정하지 않으면 기본값 setSuccessMessage로 설정된다', () => {
    mockLocation.state = { text: '예약이 완료되었습니다.' };

    const { result } = renderHook(() => useLocationMessage());

    expect(result.current.message).toEqual({
      text: '예약이 완료되었습니다.',
      type: 'success',
    });
  });
});
