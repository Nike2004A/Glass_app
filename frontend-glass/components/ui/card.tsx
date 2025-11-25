import { View, StyleSheet, ViewProps } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';

export type CardProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function Card({ style, lightColor, darkColor, ...otherProps }: CardProps) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'card');
  const borderColor = useThemeColor({}, 'cardBorder');

  return (
    <View
      style={[
        {
          backgroundColor,
          borderColor,
        },
        styles.card,
        style,
      ]}
      {...otherProps}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
