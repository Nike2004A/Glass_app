import React from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { BlurView } from 'expo-blur';

interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message?: string;
  icon?: string;
  iconColor?: string;
  buttons?: AlertButton[];
  onDismiss?: () => void;
}

export function CustomAlert({
  visible,
  title,
  message,
  icon,
  iconColor,
  buttons = [{ text: 'OK', style: 'default' }],
  onDismiss,
}: CustomAlertProps) {
  const cardBg = useThemeColor({}, 'card');
  const tint = useThemeColor({}, 'tint');
  const danger = useThemeColor({}, 'danger');
  const textColor = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const divider = useThemeColor({}, 'divider');

  const handleButtonPress = (button: AlertButton) => {
    if (button.onPress) {
      button.onPress();
    }
    if (onDismiss) {
      onDismiss();
    }
  };

  const getButtonColor = (style?: string) => {
    switch (style) {
      case 'destructive':
        return danger;
      case 'cancel':
        return textSecondary;
      default:
        return tint;
    }
  };

  const getButtonWeight = (style?: string) => {
    return style === 'cancel' ? '500' : '700';
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={onDismiss}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.alertContainer}>
              <View style={[styles.alertCard, { backgroundColor: cardBg }]}>
                {/* Icon */}
                {icon && (
                  <View style={styles.iconContainer}>
                    <View
                      style={[
                        styles.iconCircle,
                        { backgroundColor: `${iconColor || tint}15` },
                      ]}
                    >
                      <IconSymbol
                        name={icon}
                        size={32}
                        color={iconColor || tint}
                      />
                    </View>
                  </View>
                )}

                {/* Title */}
                <ThemedText style={[styles.title, { color: textColor }]}>
                  {title}
                </ThemedText>

                {/* Message */}
                {message && (
                  <ThemedText style={[styles.message, { color: textSecondary }]}>
                    {message}
                  </ThemedText>
                )}

                {/* Buttons */}
                <View style={styles.buttonsContainer}>
                  {buttons.map((button, index) => (
                    <React.Fragment key={index}>
                      {index > 0 && (
                        <View
                          style={[styles.buttonDivider, { backgroundColor: divider }]}
                        />
                      )}
                      <TouchableOpacity
                        style={[
                          styles.button,
                          button.style === 'destructive' && styles.destructiveButton,
                        ]}
                        onPress={() => handleButtonPress(button)}
                        activeOpacity={0.7}
                      >
                        <ThemedText
                          style={[
                            styles.buttonText,
                            {
                              color: getButtonColor(button.style),
                              fontWeight: getButtonWeight(button.style) as any,
                            },
                          ]}
                        >
                          {button.text}
                        </ThemedText>
                      </TouchableOpacity>
                    </React.Fragment>
                  ))}
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  alertContainer: {
    width: '100%',
    maxWidth: 340,
  },
  alertCard: {
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  buttonsContainer: {
    gap: 0,
  },
  button: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    marginVertical: 4,
  },
  destructiveButton: {
    // Optional: add background color for destructive buttons
  },
  buttonDivider: {
    height: 0, // No divider for now, using gap instead
  },
  buttonText: {
    fontSize: 16,
  },
});
