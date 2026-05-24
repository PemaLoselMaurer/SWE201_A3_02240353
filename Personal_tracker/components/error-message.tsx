import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, Radius, Shadow } from '@/constants/theme';

interface Props {
  message: string;
  onRetry?: () => void;
}

export function ErrorMessage({ message, onRetry }: Props) {
  return (
    <View style={[styles.container, Shadow.sm]}>
      <View style={styles.iconCircle}>
        <Text style={styles.icon}>⚠️</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>Something went wrong</Text>
        <Text style={styles.text}>{message}</Text>
      </View>
      {onRetry && (
        <TouchableOpacity style={styles.btn} onPress={onRetry}>
          <Text style={styles.btnText}>Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: '#FED7D7',
    marginHorizontal: 20,
    marginVertical: 8,
    padding: 16,
    gap: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: { fontSize: 18 },
  content: { flex: 1 },
  title: { fontSize: 13, fontWeight: '700', color: Colors.danger, marginBottom: 2 },
  text: { fontSize: 13, color: '#991B1B', lineHeight: 18 },
  btn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: Colors.danger,
    borderRadius: Radius.md,
  },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
});
