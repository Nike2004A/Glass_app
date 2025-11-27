import { View, Image, StyleSheet, Animated } from 'react-native';
import { useEffect, useRef } from 'react';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';

interface GlassLoaderProps {
  message?: string;
}

export function GlassLoader({ message = 'Cargando...' }: GlassLoaderProps) {
  const fadeAnim = useRef(new Animated.Value(0.3)).current;
  const textSecondary = useThemeColor({}, 'textSecondary');

  useEffect(() => {
    // Create pulsing animation
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [fadeAnim]);

  return (
    <View style={styles.container}>
      <Animated.View style={{ opacity: fadeAnim }}>
        <Image
          source={require('@/assets/images/glass_sin_fondo2.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>
      {message && (
        <ThemedText style={[styles.message, { color: textSecondary }]}>
          {message}
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 100,
    height: 100,
  },
  message: {
    marginTop: 20,
    fontSize: 16,
    textAlign: 'center',
  },
});
