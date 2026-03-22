import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, expect, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReservationSearchForm, type ReservationSearchFormProps } from './ReservationSearchForm';
import { Suspense } from 'react';

const mockRooms = [
  { id: '1', name: '회의실 A', floor: 3, capacity: 10, equipment: ['tv'] },
  { id: '2', name: '회의실 B', floor: 5, capacity: 6, equipment: [] },
  { id: '3', name: '회의실 C', floor: 7, capacity: 4, equipment: [] },
];

vi.mock('services/room', async () => {
  const actual = await vi.importActual('services/room');
  return {
    ...actual,
    roomQueries: {
      all: () => ['rooms'],
      list: () => ({
        queryKey: ['rooms', 'list'],
        queryFn: () => Promise.resolve(mockRooms),
      }),
    },
  };
});

type FormProps = Omit<Partial<ReservationSearchFormProps>, 'onChange'>;

function renderForm(overrides: FormProps = {}) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const onChange = vi.fn();
  const props: ReservationSearchFormProps = { ...overrides, onChange };

  render(
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={null}>
        <ReservationSearchForm {...props} />
      </Suspense>
    </QueryClientProvider>
  );

  return { onChange };
}

describe('ReservationSearchForm', () => {
  test('시작 시간 옵션이 timeStep 간격으로 생성된다', async () => {
    renderForm({ availableTime: { startTime: '09:00', endTime: '10:00', timeStep: 30 } });

    const startSelect = await screen.findByLabelText('시작 시간') as HTMLSelectElement;
    const values = Array.from(startSelect.options)
      .map(o => o.value)
      .filter(v => v !== '');

    expect(values).toEqual(['09:00', '09:30', '10:00']);
  });

  test('startTime, endTime, timeStep을 지정하지 않으면 기본값으로 렌더링된다', async () => {
    renderForm();

    const startSelect = await screen.findByLabelText('시작 시간') as HTMLSelectElement;
    const values = Array.from(startSelect.options)
      .map(o => o.value)
      .filter(v => v !== '');

    // 기본값: 09:00 ~ 20:00, 30분 간격 → 23개 옵션
    expect(values[0]).toBe('09:00');
    expect(values[values.length - 1]).toBe('20:00');
    expect(values).toHaveLength(23);
  });

  test('선호 층 옵션이 rooms에서 추출한 층으로 정렬되어 생성된다', async () => {
    renderForm();

    const floorSelect = await screen.findByLabelText('선호 층') as HTMLSelectElement;
    const texts = Array.from(floorSelect.options).map(o => o.textContent);

    expect(texts).toEqual(['전체', '3층', '5층', '7층']);
  });

  test('참석 인원 기본값이 1이다', async () => {
    renderForm();

    const input = await screen.findByLabelText('참석 인원') as HTMLInputElement;
    expect(input.value).toBe('1');
  });

  test('폼 값 변경 시 onChange가 호출된다', async () => {
    const user = userEvent.setup();
    const { onChange } = renderForm();

    await screen.findByLabelText('시작 시간');
    await user.selectOptions(screen.getByLabelText('시작 시간'), '10:00');

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        isValid: expect.any(Boolean),
        values: expect.objectContaining({ start: '10:00' }),
      })
    );
  });

  test('장비 버튼을 클릭하면 토글된다', async () => {
    const user = userEvent.setup();
    const { onChange } = renderForm();

    await screen.findByLabelText('TV');
    await user.click(screen.getByLabelText('TV'));

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        values: expect.objectContaining({ equipment: ['tv'] }),
      })
    );

    await user.click(screen.getByLabelText('TV'));

    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        values: expect.objectContaining({ equipment: [] }),
      })
    );
  });

  test('여러 장비를 선택할 수 있다', async () => {
    const user = userEvent.setup();
    const { onChange } = renderForm();

    await screen.findByLabelText('TV');
    await user.click(screen.getByLabelText('TV'));
    await user.click(screen.getByLabelText('스피커'));

    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        values: expect.objectContaining({ equipment: ['tv', 'speaker'] }),
      })
    );
  });

  test('종료 시간이 시작 시간보다 빠르면 에러 메시지가 표시된다', async () => {
    const user = userEvent.setup();
    renderForm();

    await screen.findByLabelText('시작 시간');
    await user.selectOptions(screen.getByLabelText('시작 시간'), '14:00');
    await user.selectOptions(screen.getByLabelText('종료 시간'), '10:00');

    expect(await screen.findByText('종료 시간은 시작 시간보다 늦어야 합니다.')).toBeInTheDocument();
  });

  test('종료 시간이 시작 시간보다 늦으면 에러 메시지가 표시되지 않는다', async () => {
    const user = userEvent.setup();
    renderForm();

    await screen.findByLabelText('시작 시간');
    await user.selectOptions(screen.getByLabelText('시작 시간'), '10:00');
    await user.selectOptions(screen.getByLabelText('종료 시간'), '14:00');

    expect(screen.queryByText('종료 시간은 시작 시간보다 늦어야 합니다.')).not.toBeInTheDocument();
  });

  test('initialValues를 전달하면 폼이 해당 값으로 초기화된다', async () => {
    renderForm({
      initialValues: {
        date: '2026-04-01',
        start: '10:00',
        end: '11:00',
        attendees: 5,
      },
    });

    expect((await screen.findByLabelText('날짜') as HTMLInputElement).value).toBe('2026-04-01');
    expect((screen.getByLabelText('시작 시간') as HTMLSelectElement).value).toBe('10:00');
    expect((screen.getByLabelText('종료 시간') as HTMLSelectElement).value).toBe('11:00');
    expect((screen.getByLabelText('참석 인원') as HTMLInputElement).value).toBe('5');
  });

  test('initialValues를 전달하지 않으면 기본값으로 초기화된다', async () => {
    renderForm();

    const today = new Date().toISOString().split('T')[0];

    expect((await screen.findByLabelText('날짜') as HTMLInputElement).value).toBe(today);
    expect((screen.getByLabelText('시작 시간') as HTMLSelectElement).value).toBe('');
    expect((screen.getByLabelText('종료 시간') as HTMLSelectElement).value).toBe('');
    expect((screen.getByLabelText('참석 인원') as HTMLInputElement).value).toBe('1');
  });

  test('initialValues로 일부 필드만 전달하면 나머지는 기본값을 유지한다', async () => {
    renderForm({
      initialValues: {
        start: '14:00',
      },
    });

    const today = new Date().toISOString().split('T')[0];

    expect((await screen.findByLabelText('시작 시간') as HTMLSelectElement).value).toBe('14:00');
    expect((screen.getByLabelText('날짜') as HTMLInputElement).value).toBe(today);
    expect((screen.getByLabelText('참석 인원') as HTMLInputElement).value).toBe('1');
  });
});
