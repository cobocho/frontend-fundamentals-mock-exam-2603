import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, expect, vi } from 'vitest';
import { ReservationForm, type ReservationFormProps } from './ReservationForm';

const defaultProps: ReservationFormProps = {
  floors: [1, 2, 3],
  startTime: '09:00',
  endTime: '18:00',
  timeStep: 30,
  onChange: vi.fn(),
};

function renderForm(overrides: Partial<ReservationFormProps> = {}) {
  const props = { ...defaultProps, ...overrides, onChange: vi.fn() };
  render(<ReservationForm {...props} />);
  return props;
}

function getSelectByIndex(index: number) {
  return screen.getAllByRole('combobox')[index] as HTMLSelectElement;
}

function getStartSelect() {
  return getSelectByIndex(0);
}

function getEndSelect() {
  return getSelectByIndex(1);
}

describe('ReservationForm', () => {
  test('시작 시간 옵션이 timeStep 간격으로 생성된다', () => {
    renderForm({ startTime: '09:00', endTime: '10:00', timeStep: 30 });

    const options = Array.from(getStartSelect().options);
    const values = options.map(o => o.value).filter(v => v !== '');

    expect(values).toEqual(['09:00', '09:30', '10:00']);
  });

  test('선호 층 옵션이 floors prop에 따라 생성된다', () => {
    renderForm({ floors: [5, 10] });

    const floorSelect = screen.getByLabelText('선호 층') as HTMLSelectElement;
    const texts = Array.from(floorSelect.options).map(o => o.textContent);

    expect(texts).toEqual(['전체', '5층', '10층']);
  });

  test('날짜 입력의 min 값이 오늘 날짜로 설정된다', () => {
    renderForm();

    const dateInput = screen.getByLabelText('날짜') as HTMLInputElement;
    const today = new Date().toISOString().split('T')[0];

    expect(dateInput.min).toBe(today);
  });

  test('참석 인원 기본값이 1이다', () => {
    renderForm();

    const input = screen.getByLabelText('참석 인원') as HTMLInputElement;
    expect(input.value).toBe('1');
  });

  test('폼 값 변경 시 onChange가 호출된다', async () => {
    const user = userEvent.setup();
    const { onChange } = renderForm();

    await user.selectOptions(getStartSelect(), '10:00');

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

    await user.click(screen.getByText('TV'));

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        values: expect.objectContaining({ equipment: ['tv'] }),
      })
    );

    await user.click(screen.getByText('TV'));

    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        values: expect.objectContaining({ equipment: [] }),
      })
    );
  });

  test('여러 장비를 선택할 수 있다', async () => {
    const user = userEvent.setup();
    const { onChange } = renderForm();

    await user.click(screen.getByText('TV'));
    await user.click(screen.getByText('스피커'));

    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        values: expect.objectContaining({ equipment: ['tv', 'speaker'] }),
      })
    );
  });

  test('종료 시간이 시작 시간보다 빠르면 에러 메시지가 표시된다', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.selectOptions(getStartSelect(), '14:00');
    await user.selectOptions(getEndSelect(), '10:00');

    expect(await screen.findByText('종료 시간은 시작 시간보다 늦어야 합니다.')).toBeInTheDocument();
  });

  test('종료 시간이 시작 시간보다 늦으면 에러 메시지가 표시되지 않는다', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.selectOptions(getStartSelect(), '10:00');
    await user.selectOptions(getEndSelect(), '14:00');

    expect(screen.queryByText('종료 시간은 시작 시간보다 늦어야 합니다.')).not.toBeInTheDocument();
  });
});
