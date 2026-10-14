import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radii, spacing, typography } from '../theme';

export default function TipCalculatorScreen() {
  const insets = useSafeAreaInsets();
  const [amount, setAmount] = useState('');

  return (
    <View
      testID="tip-calculator-screen"
      style={[
        styles.screen,
        {
          paddingTop: insets.top + spacing.space5,
          paddingBottom: insets.bottom + spacing.space5,
        },
      ]}
    >
      <Text style={styles.heading}>Trinkgeld-Rechner</Text>
      <View style={styles.field}>
        <Text style={styles.label}>Betrag</Text>
        <TextInput
          testID="amount-input"
          accessibilityLabel="Betrag"
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
          maxLength={20}
          placeholder="0,00"
          placeholderTextColor={colors.muted}
          style={styles.input}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.space4,
    gap: spacing.space4,
  },
  heading: {
    color: colors.fg,
    fontSize: typography.sizeH1,
    fontWeight: typography.headingWeight,
  },
  field: {
    gap: spacing.space1,
  },
  label: {
    color: colors.muted,
    fontSize: typography.sizeLabel,
    fontWeight: typography.labelWeight,
  },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    color: colors.fg,
    fontSize: typography.sizeBody,
    minHeight: 48,
    paddingHorizontal: spacing.space2,
    paddingVertical: spacing.space2,
  },
});

export const tipCalculatorScreenStyles = styles;
