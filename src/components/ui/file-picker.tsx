import Ionicons from '@expo/vector-icons/Ionicons';
import * as DocumentPicker from 'expo-document-picker';
import { Image } from 'expo-image';
import { photoSource } from '@/utils/photos';
import * as ImagePicker from 'expo-image-picker';
import { Pressable, StyleSheet, View } from 'react-native';

import { Colors, Radius, Spacing } from '@/constants/theme';
import type { AttachedFile } from '@/types/models';
import { newId } from '@/utils/format';

import { AppText } from './text';

/** Shows the chosen photos as small squares, with an "Add photo" square to add more. */
export function PhotoPicker({
  value,
  onChange,
  max = 8,
  label,
  hint,
  error,
}: {
  value: string[];
  onChange: (uris: string[]) => void;
  max?: number;
  label?: string;
  hint?: string;
  error?: string | null;
}) {
  const pick = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: max - value.length,
      quality: 0.7,
    });
    if (!res.canceled) onChange([...value, ...res.assets.map((a) => a.uri)].slice(0, max));
  };

  return (
    <View style={styles.wrap}>
      {label && <AppText variant="label">{label}</AppText>}
      <View style={styles.grid}>
        {value.map((uri, i) => (
          <View key={uri + i} style={styles.thumb}>
            <Image source={photoSource(uri)} style={StyleSheet.absoluteFill} contentFit="cover" />
            <Pressable
              accessibilityLabel="Remove photo"
              onPress={() => onChange(value.filter((_, j) => j !== i))}
              style={styles.remove}
              hitSlop={6}>
              <Ionicons name="close" size={14} color="#fff" />
            </Pressable>
          </View>
        ))}
        {value.length < max && (
          <Pressable accessibilityRole="button" onPress={pick} style={[styles.thumb, styles.add]}>
            <Ionicons name="camera-outline" size={24} color={Colors.primary} />
            <AppText variant="tiny" color={Colors.primary}>
              Add photo
            </AppText>
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

/** Shows the attached documents, like PDFs or pictures, with a button to attach more. */
export function DocumentList({
  value,
  onChange,
  label,
  hint,
  readOnly,
}: {
  value: AttachedFile[];
  onChange?: (files: AttachedFile[]) => void;
  label?: string;
  hint?: string;
  readOnly?: boolean;
}) {
  const pick = async () => {
    const res = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/*'],
      multiple: true,
      copyToCacheDirectory: true,
    });
    if (res.canceled) return;
    const files: AttachedFile[] = res.assets.map((a) => ({
      id: newId('doc'),
      name: a.name,
      uri: a.uri,
      kind: a.mimeType?.startsWith('image/') ? 'image' : 'document',
    }));
    onChange?.([...value, ...files]);
  };

  return (
    <View style={styles.wrap}>
      {label && <AppText variant="label">{label}</AppText>}
      {value.map((f) => (
        <View key={f.id} style={styles.doc}>
          <Ionicons
            name={f.kind === 'image' ? 'image-outline' : 'document-text-outline'}
            size={20}
            color={Colors.primary}
          />
          <AppText variant="body" style={{ flex: 1 }} numberOfLines={1}>
            {f.name}
          </AppText>
          {!readOnly && (
            <Pressable
              accessibilityLabel={`Remove ${f.name}`}
              onPress={() => onChange?.(value.filter((x) => x.id !== f.id))}
              hitSlop={8}>
              <Ionicons name="trash-outline" size={18} color={Colors.textMuted} />
            </Pressable>
          )}
        </View>
      ))}
      {readOnly && value.length === 0 && <AppText variant="caption">No documents attached.</AppText>}
      {!readOnly && (
        <Pressable accessibilityRole="button" onPress={pick} style={styles.attach}>
          <Ionicons name="attach" size={18} color={Colors.primary} />
          <AppText variant="label" color={Colors.primary}>
            Attach document
          </AppText>
        </Pressable>
      )}
      {hint && <AppText variant="caption">{hint}</AppText>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  thumb: {
    width: 92,
    height: 92,
    borderRadius: Radius.md,
    overflow: 'hidden',
    backgroundColor: Colors.surfaceAlt,
  },
  add: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: Colors.primary,
    backgroundColor: Colors.primarySoft,
  },
  remove: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  doc: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  attach: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: Colors.primary,
  },
});
