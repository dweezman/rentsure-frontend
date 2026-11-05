import type { ImageSource } from 'expo-image';

/**
 * The sample house photos that come with the app, kept in assets/images/properties.
 * The sample data refers to each photo by a short name like "asset:yaba1", and this file finds the real picture.
 * Photos from the real backend will be normal web links, and those are used as they are.
 */
const BUNDLED: Record<string, number> = {
  yaba1: require('@/assets/images/properties/yaba1.jpg'),
  yaba2: require('@/assets/images/properties/yaba2.jpg'),
  yaba3: require('@/assets/images/properties/yaba3.jpg'),
  yaba4: require('@/assets/images/properties/yaba4.jpg'),
  yaba5: require('@/assets/images/properties/yaba5.jpg'),
  gbagada1: require('@/assets/images/properties/gbagada1.jpg'),
  gbagada2: require('@/assets/images/properties/gbagada2.jpg'),
  gbagada3: require('@/assets/images/properties/gbagada3.jpg'),
  gbagada4: require('@/assets/images/properties/gbagada4.jpg'),
  lekki1: require('@/assets/images/properties/lekki1.jpg'),
  lekki2: require('@/assets/images/properties/lekki2.jpg'),
  lekki3: require('@/assets/images/properties/lekki3.jpg'),
  lekki4: require('@/assets/images/properties/lekki4.jpg'),
  lekki5: require('@/assets/images/properties/lekki5.jpg'),
  lekki6: require('@/assets/images/properties/lekki6.jpg'),
  lekki7: require('@/assets/images/properties/lekki7.jpg'),
  lekki8: require('@/assets/images/properties/lekki8.jpg'),
  akoka1: require('@/assets/images/properties/akoka1.jpg'),
  akoka2: require('@/assets/images/properties/akoka2.jpg'),
  akoka3: require('@/assets/images/properties/akoka3.jpg'),
  akoka4: require('@/assets/images/properties/akoka4.jpg'),
  akoka5: require('@/assets/images/properties/akoka5.jpg'),
  bodija1: require('@/assets/images/properties/bodija1.jpg'),
  bodija2: require('@/assets/images/properties/bodija2.jpg'),
  bodija3: require('@/assets/images/properties/bodija3.jpg'),
  bodija4: require('@/assets/images/properties/bodija4.jpg'),
  bodija5: require('@/assets/images/properties/bodija5.jpg'),
  wuse1: require('@/assets/images/properties/wuse1.jpg'),
  wuse2: require('@/assets/images/properties/wuse2.jpg'),
  wuse3: require('@/assets/images/properties/wuse3.jpg'),
  wuse4: require('@/assets/images/properties/wuse4.jpg'),
};

/** Takes a photo name or link and returns a picture the app can show. */
export function photoSource(ref: string): ImageSource | number | string | null {
  if (ref.startsWith('asset:')) return BUNDLED[ref.slice('asset:'.length)] ?? null;
  return ref;
}
