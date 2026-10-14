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

const PLACEHOLDER = '-';

type DisplayValues = {
  tip: string;
  total: string;
  perPerson: string;
};

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

type ResultsPanelProps = {
  result: TipResult;
  hasTouched: boolean;
};

function ResultsPanel({ result, hasTouched }: ResultsPanelProps) {
  const values: DisplayValues | null = result.ok
    ? {
        tip: formatCents(result.tipCents),
        total: formatCents(result.totalCents),
        perPerson: formatCents(result.perPersonCents),
      }
    : null;

  const showPlaceholder = !hasTouched;
  const showHint = hasTouched && !result.ok;

  const valueFor = (field: keyof DisplayValues): string => {
    if (showPlaceholder) {
      return PLACEHOLDER;
    }
    return values ? values[field] : '';
  };

  return (
    <View style={styles.results}>
      {showHint ? (
        <View testID="result-hint" style={styles.hintBox}>
          <Text style={styles.hintText}>{NEUTRAL_HINT}</Text>
        </View>
      ) : null}
      {RESULT_ROWS.map((row, index) => (
        <Fragment key={row.testID}>
          {index > 0 ? <View style={styles.divider} /> : null}
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel} numberOfLines={1}>
              {row.label}
            </Text>
            <Text
              testID={row.testID}
              style={[
                styles.resultValue,
                showPlaceholder ? styles.resultPlaceholder : null,
                values && row.field === 'perPerson' ? styles.resultValueAccent : null,
              ]}
            >
              {valueFor(row.field)}
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
  const hasTouched = touched.amount || touched.tipPercent || touched.partySize;

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
      <ResultsPanel result={result} hasTouched={hasTouched} />
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
    marginTop: spacing.space0,
  },
  results: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.space3,
    paddingVertical: spacing.space1,
  },
  hintBox: {
    alignItems: 'center',
    backgroundColor: colors.errorSoft,
    borderRadius: radii.md,
    marginTop: spacing.space1,
    marginBottom: spacing.space1,
    padding: spacing.space3,
  },
  hintText: {
    color: colors.error,
    fontSize: typography.sizeBody,
    fontWeight: typography.bodyWeight,
    lineHeight: typography.sizeBody * typography.lineHeight,
    textAlign: 'center',
  },
  resultRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.space2,
  },
  resultLabel: {
    color: colors.muted,
    flexShrink: 1,
    fontSize: typography.sizeLabel,
    fontWeight: typography.labelWeight,
  },
  resultValue: {
    color: colors.fg,
    flexShrink: 0,
    fontVariant: ['tabular-nums'],
    fontSize: typography.sizeResult,
    fontWeight: typography.headingWeight,
    marginLeft: spacing.space2,
    textAlign: 'right',
  },
  resultPlaceholder: {
    color: colors.muted,
  },
  resultValueAccent: {
    color: colors.accent,
  },
  divider: {
    backgroundColor: colors.divider,
    height: 1,
  },
});
