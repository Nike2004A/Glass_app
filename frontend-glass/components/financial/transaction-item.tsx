import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Transaction } from '@/types/financial';

interface TransactionItemProps {
  transaction: Transaction;
  onPress?: () => void;
}

export function TransactionItem({ transaction, onPress }: TransactionItemProps) {
  const textSecondary = useThemeColor({}, 'textSecondary');
  const divider = useThemeColor({}, 'divider');
  const success = useThemeColor({}, 'success');
  const danger = useThemeColor({}, 'danger');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(Math.abs(amount));
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-MX', {
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));
  };

  const isIncome = transaction.type === 'income';
  const amountColor = isIncome ? success : danger;

  return (
    <TouchableOpacity onPress={onPress} disabled={!onPress}>
      <View style={[styles.container, { borderBottomColor: divider }]}>
        <View style={styles.iconContainer}>
          <View
            style={[
              styles.categoryIcon,
              {
                backgroundColor: isIncome
                  ? 'rgba(16, 185, 129, 0.1)'
                  : 'rgba(239, 68, 68, 0.1)',
              },
            ]}
          >
            <ThemedText style={styles.categoryEmoji}>
              {getCategoryEmoji(transaction.category)}
            </ThemedText>
          </View>
        </View>

        <View style={styles.content}>
          <ThemedText style={styles.description} numberOfLines={1}>
            {transaction.description}
          </ThemedText>
          <View style={styles.metadata}>
            <ThemedText style={[styles.merchant, { color: textSecondary }]}>
              {transaction.merchant}
            </ThemedText>
            {transaction.isRecurring && (
              <View style={styles.badge}>
                <ThemedText style={[styles.badgeText, { color: textSecondary }]}>
                  Recurrente
                </ThemedText>
              </View>
            )}
          </View>
        </View>

        <View style={styles.right}>
          <ThemedText style={[styles.amount, { color: amountColor }]}>
            {isIncome ? '+' : '-'}
            {formatCurrency(transaction.amount)}
          </ThemedText>
          <ThemedText style={[styles.date, { color: textSecondary }]}>
            {formatDate(transaction.date)}
          </ThemedText>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function getCategoryEmoji(category: string): string {
  const emojiMap: { [key: string]: string } = {
    food: '🍔',
    transport: '🚗',
    shopping: '🛍️',
    entertainment: '🎬',
    bills: '📄',
    health: '🏥',
    education: '📚',
    salary: '💰',
    investment: '📈',
    other: '📌',
  };
  return emojiMap[category.toLowerCase()] || '📌';
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
  },
  iconContainer: {
    marginRight: 12,
  },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryEmoji: {
    fontSize: 20,
  },
  content: {
    flex: 1,
    marginRight: 12,
  },
  description: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  merchant: {
    fontSize: 14,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: 'rgba(107, 114, 128, 0.1)',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '500',
  },
  right: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
  },
});
