import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { Colors, FontFamily, Radius, Spacing } from '@/constants/theme';

import { AppText } from './text';

export interface TextFieldProps extends TextInputProps {
  label?: string;
  error?: string | null;
  hint?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  /** Shows a ₦ prefix and only allows digits. */
  money?: boolean;
  required?: boolean;
}

export function TextField({
  label,
  error,
  hint,
  icon,
  money,
  required,
  secureTextEntry,
  multiline,
  style,
  onChangeText,
  keyboardType,
  ...rest
}: TextFieldProps) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(!!secureTextEntry);

  return (
    <View style={styles.wrap}>
      {label && (
        <AppText variant="label">
          {label}
          {required && <AppText variant="label" color={Colors.danger}> *</AppText>}
        </AppText>
      )}
      <View
        style={[
          styles.field,
          multiline && styles.multiline,
          focused && styles.focused,
          !!error && styles.errored,
        ]}>
        {icon && <Ionicons name={icon} size={18} color={Colors.textMuted} />}
        {money && <AppText color={Colors.textSecondary}>₦</AppText>}
        <TextInput
          placeholderTextColor={Colors.textMuted}
          style={[styles.input, multiline && styles.inputMultiline, style]}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          secureTextEntry={hidden}
          multiline={multiline}
          keyboardType={money ? 'number-pad' : keyboardType}
          onChangeText={(t) => onChangeText?.(money ? t.replace(/[^0-9]/g, '') : t)}
          accessibilityLabel={label}
          {...rest}
        />
        {secureTextEntry && (
          <Pressable
            onPress={() => setHidden((h) => !h)}
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Show password' : 'Hide password'}
            hitSlop={10}>
            <Ionicons name={hidden ? 'eye-outline' : 'eye-off-outline'} size={20} color={Colors.textMuted} />
          </Pressable>
        )}
      </View>
      {error ? (
        <AppText variant="caption" color={Colors.danger}>
          {error}
        </AppText>
      ) : hint ? (
        <AppText variant="caption">{hint}</AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    minHeight: 50,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  multiline: { alignItems: 'flex-start', paddingVertical: Spacing.md },
  focused: { borderColor: Colors.primary },
  errored: { borderColor: Colors.danger },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    fontFamily: FontFamily,
    paddingVertical: Spacing.sm,
    outlineStyle: 'none',
  } as object,
  inputMultiline: { minHeight: 96, textAlignVertical: 'top', paddingVertical: 0 },
});
