import { fireEvent, render } from '@testing-library/react-native';

import TipCalculatorScreen from './TipCalculatorScreen';

jest.mock('react-native-safe-area-context', () =>
  require('react-native-safe-area-context/jest/mock').default,
);

describe('TipCalculatorScreen', () => {
  it('renders the single calculator screen', async () => {
    const screen = await render(<TipCalculatorScreen />);
    expect(screen.getByTestId('tip-calculator-screen')).toBeTruthy();
  });

  it('renders an editable amount field', async () => {
    const screen = await render(<TipCalculatorScreen />);
    expect(screen.getByTestId('amount-input')).toBeTruthy();
  });

  it('shows the characters the user types into the amount field', async () => {
    const screen = await render(<TipCalculatorScreen />);
    await fireEvent.changeText(screen.getByTestId('amount-input'), '12,50');
    expect(screen.getByTestId('amount-input').props.value).toBe('12,50');
  });

  it('renders the three result rows', async () => {
    const screen = await render(<TipCalculatorScreen />);
    expect(screen.getByTestId('result-tip')).toBeTruthy();
    expect(screen.getByTestId('result-total')).toBeTruthy();
    expect(screen.getByTestId('result-per-person')).toBeTruthy();
  });

  it('shows the three formatted values once all fields are valid', async () => {
    const screen = await render(<TipCalculatorScreen />);
    await fireEvent.changeText(screen.getByTestId('amount-input'), '100');
    await fireEvent.changeText(screen.getByTestId('tip-percent-input'), '10');
    await fireEvent.changeText(screen.getByTestId('party-size-input'), '2');

    expect(screen.getByTestId('result-tip').props.children).toBe('10,00 €');
    expect(screen.getByTestId('result-total').props.children).toBe('110,00 €');
    expect(screen.getByTestId('result-per-person').props.children).toBe('55,00 €');
  });

  it('keeps the start state neutral without field errors', async () => {
    const screen = await render(<TipCalculatorScreen />);
    expect(screen.queryByTestId('amount-input-error')).toBeNull();
    expect(screen.queryByTestId('tip-percent-input-error')).toBeNull();
    expect(screen.queryByTestId('party-size-input-error')).toBeNull();
  });

  it('replaces the results with the hint and shows an error under an invalid touched field', async () => {
    const screen = await render(<TipCalculatorScreen />);
    await fireEvent.changeText(screen.getByTestId('amount-input'), 'a');

    expect(screen.getByTestId('result-tip').props.children).toBe('Bitte Eingaben prüfen');
    expect(screen.getByTestId('result-total').props.children).toBe('Bitte Eingaben prüfen');
    expect(screen.getByTestId('result-per-person').props.children).toBe('Bitte Eingaben prüfen');
    expect(screen.getByTestId('amount-input-error')).toBeTruthy();
    expect(screen.queryByTestId('tip-percent-input-error')).toBeNull();
  });
});
