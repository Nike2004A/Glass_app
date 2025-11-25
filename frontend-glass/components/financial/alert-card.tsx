import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Alert, SuspiciousCharge } from '@/types/financial';

interface AlertCardProps {
  alert?: Alert;
  suspiciousCharge?: SuspiciousCharge;
  onPress?: () => void;
  onAction?: () => void;
}

export function AlertCard({
  alert,
  suspiciousCharge,
  onPress,
  onAction,
}: AlertCardProps) {
  const textSecondary = useThemeColor({}, 'textSecondary');
  const warningColor = useThemeColor({}, 'warning');
  const dangerColor = useThemeColor({}, 'danger');
  const infoColor = useThemeColor({}, 'info');
  const successColor = useThemeColor({}, 'success');

  const getAlertColor = () => {
    if (suspiciousCharge) {
      if (suspiciousCharge.type === 'phantom') return dangerColor;
      if (suspiciousCharge.type === 'unusual') return warningColor;
      return infoColor;
    }
    if (alert?.type === 'danger') return dangerColor;
    if (alert?.type === 'warning') return warningColor;
    if (alert?.type === 'success') return successColor;
    return infoColor;
  };

  const getAlertIcon = () => {
    if (suspiciousCharge) {
      return 'exclamationmark.triangle.fill';
    }
    if (alert?.type === 'danger' || alert?.type === 'warning') {
      return 'exclamationmark.triangle.fill';
    }
    if (alert?.type === 'success') {
      return 'checkmark.circle.fill';
    }
    return 'bell.fill';
  };

  const title = suspiciousCharge
    ? getChargeTypeLabel(suspiciousCharge.type)
    : alert?.title || '';

  const message = suspiciousCharge
    ? suspiciousCharge.reason
    : alert?.message || '';

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount);
  };

  return (
    <TouchableOpacity onPress={onPress} disabled={!onPress}>
      <Card style={styles.container}>
        <View style={styles.header}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: `${getAlertColor()}20` },
            ]}
          >
            <IconSymbol
              name={getAlertIcon() as any}
              size={20}
              color={getAlertColor()}
            />
          </View>
          <View style={styles.content}>
            <ThemedText style={styles.title}>{title}</ThemedText>
            {suspiciousCharge && (
              <ThemedText style={styles.amount}>
                {formatCurrency(suspiciousCharge.amount)}
              </ThemedText>
            )}
          </View>
        </View>

        <ThemedText style={[styles.message, { color: textSecondary }]}>
          {message}
        </ThemedText>

        {suspiciousCharge && (
          <View style={styles.chargeDetails}>
            <ThemedText style={[styles.merchant, { color: textSecondary }]}>
              {suspiciousCharge.merchant}
            </ThemedText>
            <View style={styles.confidenceBadge}>
              <ThemedText
                style={[styles.confidenceText, { color: getAlertColor() }]}
              >
                {suspiciousCharge.confidence}% confianza
              </ThemedText>
            </View>
          </View>
        )}

        {(alert?.actionable || suspiciousCharge) && (
          <TouchableOpacity style={styles.actionButton} onPress={onAction}>
            <ThemedText style={[styles.actionText, { color: getAlertColor() }]}>
              {suspiciousCharge ? 'Revisar y disputar' : 'Tomar acción'}
            </ThemedText>
          </TouchableOpacity>
        )}
      </Card>
    </TouchableOpacity>
  );
}

function getChargeTypeLabel(type: string): string {
  const labels: { [key: string]: string } = {
    phantom: 'Cargo Fantasma Detectado',
    unusual: 'Cargo Inusual',
    duplicate: 'Posible Cargo Duplicado',
    'high-amount': 'Cargo de Monto Alto',
  };
  return labels[type] || 'Cargo Sospechoso';
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  amount: {
    fontSize: 18,
    fontWeight: '700',
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  chargeDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  merchant: {
    fontSize: 14,
    fontWeight: '500',
  },
  confidenceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: '600',
  },
  actionButton: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
