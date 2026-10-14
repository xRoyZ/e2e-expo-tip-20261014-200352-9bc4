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
});
