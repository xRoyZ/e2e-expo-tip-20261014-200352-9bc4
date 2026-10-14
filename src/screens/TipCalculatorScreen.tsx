import { Fragment, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { calculateTip } from '../tip/calculateTip';
import { formatCents } from '../tip/formatCents';
import type { FieldErrors, TipErrorCode, TipInput, TipResult } from '../tip/types';
import { colors, radii, spacing, typography } from '../theme';

type FieldKey = keyof TipInput;

const ERROR_MESSAGES: Record<TipErrorCode, string> = {
  required: 'Bitte einen Wert eingeben.',
  'not-a-number': 'Bitte eine gültige Zahl eingeben.',
  negative: 'Der Betrag darf nicht negativ sein.',
  'out-of-range': 'Bitte einen Wert zwischen 0 und 100 eingeben.',
  'not-an-integer': 'Bitte eine ganze Zahl eingeben.',
  'below-one': 'Mindestens 1 Person.',
};

const NEUTRAL_HINT = 'Bitte Eingaben prüfen';

const NO_ERRORS: FieldErrors = {};

const EMPTY_FIELDS: TipInput = { amount: '', tipPercent: '', partySize: '' };

type DisplayValues = {
  tip: string;
  total: string;
  perPerson: string;
};

function toDisplayValues(result: TipResult): DisplayValues {
  if (!result.ok) {
    return { tip: NEUTRAL_HINT, total: NEUTRAL_HINT, perPerson: NEUTRAL_HINT };
  }
  return {
    tip: formatCents(result.tipCents),
    total: formatCents(result.totalCents),
    perPerson: formatCents(result.perPersonCents),
  };
}

type FieldProps = {
  label: string;
  testID: string;
  accessibilityLabel: string;
  value: string;
  placeholder: string;
  keyboardType: 'decimal-pad' | 'number-pad';
  errorMessage: string | null;
  onChangeText: (text: string) => void;
};

function Field({
  label,
  testID,
  accessibilityLabel,
  value,
  placeholder,
  keyboardType,
  errorMessage,
  onChangeText,
}: FieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        testID={testID}
        accessibilityLabel={accessibilityLabel}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        maxLength={20}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        style={[styles.input, errorMessage ? styles.inputError : null]}
      />
      {errorMessage ? (
        <Text testID={`${testID}-error`} style={styles.errorText}>
          {errorMessage}
        </Text>
      ) : null}
    </View>
  );
}

type TipFieldsProps = {
  fields: TipInput;
  errorFor: (field: FieldKey) => string | null;
  onChange: (field: FieldKey, text: string) => void;
};

function TipFields({ fields, errorFor, onChange }: TipFieldsProps) {
  return (
    <View style={styles.fields}>
      <Field
        label="Betrag"
        testID="amount-input"
        accessibilityLabel="Betrag"
        value={fields.amount}
        placeholder="0,00"
        keyboardType="decimal-pad"
        errorMessage={errorFor('amount')}
        onChangeText={(text) => onChange('amount', text)}
      />
      <Field
        label="Trinkgeld (%)"
        testID="tip-percent-input"
        accessibilityLabel="Trinkgeld in Prozent"
        value={fields.tipPercent}
        placeholder="0"
        keyboardType="decimal-pad"
        errorMessage={errorFor('tipPercent')}
        onChangeText={(text) => onChange('tipPercent', text)}
      />
      <Field
        label="Personenzahl"
        testID="party-size-input"
        accessibilityLabel="Personenzahl"
        value={fields.partySize}
        placeholder="1"
        keyboardType="number-pad"
        errorMessage={errorFor('partySize')}
        onChangeText={(text) => onChange('partySize', text)}
      />
    </View>
  );
}

const RESULT_ROWS = [
  { testID: 'result-tip', label: 'Trinkgeld', field: 'tip' },
  { testID: 'result-total', label: 'Gesamt', field: 'total' },
  { testID: 'result-per-person', label: 'Pro Person', field: 'perPerson' },
] as const;

function ResultsPanel({ values }: { values: DisplayValues }) {
  return (
    <View style={styles.results}>
      {RESULT_ROWS.map((row, index) => (
        <Fragment key={row.testID}>
          {index > 0 ? <View style={styles.divider} /> : null}
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>{row.label}</Text>
            <Text
              testID={row.testID}
              style={[
                styles.resultValue,
                row.field === 'perPerson' ? styles.resultValueAccent : null,
              ]}
            >
              {values[row.field]}
            </Text>
          </View>
        </Fragment>
      ))}
    </View>
  );
}

export default function TipCalculatorScreen() {
  const insets = useSafeAreaInsets();
  const [fields, setFields] = useState<TipInput>(EMPTY_FIELDS);
  const [touched, setTouched] = useState<Record<FieldKey, boolean>>({
    amount: false,
    tipPercent: false,
    partySize: false,
  });

  const result = calculateTip(fields);
  const errors: FieldErrors = result.ok ? NO_ERRORS : result.errors;

  const errorFor = (field: FieldKey): string | null => {
    const code = errors[field];
    if (!touched[field] || code === undefined) {
      return null;
    }
    return ERROR_MESSAGES[code];
  };

  const onChange = (field: FieldKey, text: string) => {
    setFields((prev) => ({ ...prev, [field]: text }));
    setTouched((prev) => (prev[field] ? prev : { ...prev, [field]: true }));
  };

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
      <TipFields fields={fields} errorFor={errorFor} onChange={onChange} />
      <ResultsPanel values={toDisplayValues(result)} />
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
  fields: {
    gap: spacing.space3,
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
  inputError: {
    backgroundColor: colors.errorSoft,
    borderColor: colors.error,
  },
  errorText: {
    color: colors.error,
    fontSize: typography.sizeCaption,
  },
  results: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.space3,
    paddingVertical: spacing.space1,
  },
  resultRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.space2,
  },
  resultLabel: {
    color: colors.muted,
    fontSize: typography.sizeBody,
    fontWeight: typography.labelWeight,
  },
  resultValue: {
    color: colors.fg,
    fontVariant: ['tabular-nums'],
    fontSize: typography.sizeResult,
    fontWeight: typography.headingWeight,
  },
  resultValueAccent: {
    color: colors.accent,
  },
  divider: {
    backgroundColor: colors.divider,
    height: 1,
  },
});

export const tipCalculatorScreenStyles = styles;
