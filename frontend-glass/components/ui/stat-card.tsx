import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon?: string;
  iconColor?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  iconColor,
  trend,
  trendValue,
}: StatCardProps) {
  const textSecondary = useThemeColor({}, 'textSecondary');
  const successColor = useThemeColor({}, 'success');
  const dangerColor = useThemeColor({}, 'danger');

  const getTrendColor = () => {
    if (trend === 'up') return successColor;
    if (trend === 'down') return dangerColor;
    return textSecondary;
  };

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={[styles.title, { color: textSecondary }]}>
          {title}
        </ThemedText>
        {icon && (
          <IconSymbol
            name={icon as any}
            size={20}
            color={iconColor || textSecondary}
          />
        )}
      </View>
      <ThemedText type="title" style={styles.value}>
        {value}
      </ThemedText>
      {(subtitle || trend) && (
        <View style={styles.footer}>
          {trendValue && (
            <ThemedText style={[styles.trend, { color: getTrendColor() }]}>
              {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '•'} {trendValue}
            </ThemedText>
          )}
          {subtitle && (
            <ThemedText style={[styles.subtitle, { color: textSecondary }]}>
              {subtitle}
            </ThemedText>
          )}
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 120,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
  },
  value: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  trend: {
    fontSize: 14,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 12,
  },
});
