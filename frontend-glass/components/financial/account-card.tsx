import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { BankAccount } from '@/types/financial';

interface AccountCardProps {
  account: BankAccount;
  onPress?: () => void;
}

export function AccountCard({ account, onPress }: AccountCardProps) {
  const textSecondary = useThemeColor({}, 'textSecondary');
  const tint = useThemeColor({}, 'tint');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: account.currency,
    }).format(amount);
  };

  const getAccountTypeIcon = () => {
    switch (account.type) {
      case 'checking':
        return 'banknote.fill';
      case 'savings':
        return 'arrow.up.circle.fill';
      case 'investment':
        return 'chart.bar.fill';
      default:
        return 'creditcard.fill';
    }
  };

  const getStatusColor = () => {
    if (account.status === 'active') return tint;
    if (account.status === 'syncing') return useThemeColor({}, 'warning');
    return textSecondary;
  };

  return (
    <TouchableOpacity onPress={onPress} disabled={!onPress}>
      <Card style={styles.container}>
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: `${tint}15` }]}>
            <IconSymbol
              name={getAccountTypeIcon() as any}
              size={24}
              color={tint}
            />
          </View>
          <View style={styles.statusIndicator}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: getStatusColor() },
              ]}
            />
          </View>
        </View>

        <ThemedText type="subtitle" style={styles.accountName}>
          {account.name}
        </ThemedText>

        <ThemedText style={[styles.bank, { color: textSecondary }]}>
          {account.bank}
        </ThemedText>

        <View style={styles.balanceContainer}>
          <ThemedText type="title" style={styles.balance}>
            {formatCurrency(account.balance)}
          </ThemedText>
        </View>

        <View style={styles.footer}>
          <ThemedText style={[styles.accountNumber, { color: textSecondary }]}>
            •••• {account.accountNumber.slice(-4)}
          </ThemedText>
          <ThemedText style={[styles.lastSync, { color: textSecondary }]}>
            Actualizado hace {getTimeSince(account.lastSync)}
          </ThemedText>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

function getTimeSince(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'un momento';
  if (diffMins < 60) return `${diffMins}m`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d`;
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  accountName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  bank: {
    fontSize: 14,
    marginBottom: 12,
  },
  balanceContainer: {
    marginBottom: 12,
  },
  balance: {
    fontSize: 32,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  accountNumber: {
    fontSize: 12,
  },
  lastSync: {
    fontSize: 12,
  },
});
