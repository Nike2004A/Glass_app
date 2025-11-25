import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { CreditCard } from '@/types/financial';
import { LinearGradient } from 'expo-linear-gradient';

interface CreditCardViewProps {
  card: CreditCard;
  onPress?: () => void;
}

export function CreditCardView({ card, onPress }: CreditCardViewProps) {
  const textSecondary = useThemeColor({}, 'textSecondary');
  const warningColor = useThemeColor({}, 'warning');
  const tint = useThemeColor({}, 'tint');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: card.currency,
    }).format(amount);
  };

  const utilizationPercentage = (card.balance / card.limit) * 100;
  const isHighUtilization = utilizationPercentage > 70;

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-MX', {
      day: '2-digit',
      month: 'short',
    }).format(new Date(date));
  };

  const getCardGradient = () => {
    const gradients = [
      ['#667eea', '#764ba2'],
      ['#f093fb', '#f5576c'],
      ['#4facfe', '#00f2fe'],
      ['#43e97b', '#38f9d7'],
      ['#fa709a', '#fee140'],
    ];
    const index = parseInt(card.id.slice(-1), 36) % gradients.length;
    return gradients[index];
  };

  return (
    <TouchableOpacity onPress={onPress} disabled={!onPress}>
      <View style={styles.cardContainer}>
        <LinearGradient
          colors={getCardGradient()}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <ThemedText style={styles.cardBank}>{card.bank}</ThemedText>
              {card.autoPayEnabled && (
                <View style={styles.autoPay}>
                  <IconSymbol name="bolt.fill" size={14} color="#fff" />
                  <ThemedText style={styles.autoPayText}>Auto</ThemedText>
                </View>
              )}
            </View>

            <View style={styles.cardMiddle}>
              <ThemedText style={styles.cardName}>{card.name}</ThemedText>
              <ThemedText style={styles.cardNumber}>
                •••• •••• •••• {card.last4}
              </ThemedText>
            </View>

            <View style={styles.cardFooter}>
              <View style={styles.balanceInfo}>
                <ThemedText style={styles.balanceLabel}>Balance</ThemedText>
                <ThemedText style={styles.balanceAmount}>
                  {formatCurrency(card.balance)}
                </ThemedText>
              </View>
              <View style={styles.limitInfo}>
                <ThemedText style={styles.limitLabel}>
                  de {formatCurrency(card.limit)}
                </ThemedText>
              </View>
            </View>
          </View>
        </LinearGradient>

        <Card style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <ThemedText style={[styles.infoLabel, { color: textSecondary }]}>
                Pago mínimo
              </ThemedText>
              <ThemedText style={styles.infoValue}>
                {formatCurrency(card.minPayment)}
              </ThemedText>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoItem}>
              <ThemedText style={[styles.infoLabel, { color: textSecondary }]}>
                Fecha de pago
              </ThemedText>
              <ThemedText style={styles.infoValue}>
                {formatDate(card.dueDate)}
              </ThemedText>
            </View>
          </View>

          <View style={styles.utilizationContainer}>
            <View style={styles.utilizationHeader}>
              <ThemedText style={[styles.utilizationLabel, { color: textSecondary }]}>
                Utilización
              </ThemedText>
              <ThemedText
                style={[
                  styles.utilizationPercentage,
                  { color: isHighUtilization ? warningColor : tint },
                ]}
              >
                {utilizationPercentage.toFixed(0)}%
              </ThemedText>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min(utilizationPercentage, 100)}%`,
                    backgroundColor: isHighUtilization ? warningColor : tint,
                  },
                ]}
              />
            </View>
          </View>
        </Card>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: 16,
  },
  gradient: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    minHeight: 200,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardBank: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    opacity: 0.9,
  },
  autoPay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  autoPayText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  cardMiddle: {
    marginTop: 20,
  },
  cardName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  cardNumber: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 2,
    opacity: 0.9,
  },
  cardFooter: {
    marginTop: 20,
  },
  balanceInfo: {
    marginBottom: 4,
  },
  balanceLabel: {
    color: '#fff',
    fontSize: 12,
    opacity: 0.8,
    marginBottom: 4,
  },
  balanceAmount: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
  },
  limitInfo: {
    marginTop: 2,
  },
  limitLabel: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.8,
  },
  infoCard: {
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  infoItem: {
    flex: 1,
    alignItems: 'center',
  },
  divider: {
    width: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  infoLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  utilizationContainer: {
    marginTop: 8,
  },
  utilizationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  utilizationLabel: {
    fontSize: 14,
  },
  utilizationPercentage: {
    fontSize: 14,
    fontWeight: '700',
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
});
