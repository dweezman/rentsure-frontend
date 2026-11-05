import { Image } from 'expo-image';
import { photoSource } from '@/utils/photos';
import { useState } from 'react';
import { ScrollView, StyleSheet, View, type LayoutChangeEvent } from 'react-native';

import { AppText } from '@/components/ui';
import { Colors, MaxContentWidth } from '@/constants/theme';

/** Swipeable photo gallery with a "2 / 5" counter. */
export function PhotoCarousel({ photos, title }: { photos: string[]; title: string }) {
  const [width, setWidth] = useState(0);
  const [index, setIndex] = useState(0);

  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  return (
    <View style={styles.wrap} onLayout={onLayout}>
      {width > 0 && (
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
          onScroll={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
          scrollEventThrottle={64}>
          {photos.map((uri, i) => (
            <Image
              key={uri + i}
              source={photoSource(uri)}
              style={{ width, height: width * 0.62 }}
              contentFit="cover"
              transition={200}
              accessibilityLabel={`${title}, photo ${i + 1} of ${photos.length}`}
            />
          ))}
        </ScrollView>
      )}
      {photos.length > 1 && (
        <View style={styles.counter}>
          <AppText variant="tiny" color="#fff">
            {index + 1} / {photos.length}
          </AppText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    backgroundColor: Colors.surfaceAlt,
    minHeight: 200,
  },
  counter: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
});
