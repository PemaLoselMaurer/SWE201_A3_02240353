import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Expense, Category } from '@/utils/types';
import { Colors, Radius, Shadow } from '@/constants/theme';
import { formatCurrency, formatDate } from '@/utils/formatters';

interface Props {
  expense: Expense;
  category?: Category;
  onPress: () => void;
}

export function ExpenseCard({ expense, category, onPress }: Props) {
  const accentColor = category?.color ?? Colors.primary;

  return (
    <TouchableOpacity style={[styles.card, Shadow.sm]} onPress={onPress} activeOpacity={0.75}>
      {/* Left color accent */}
      <View style={[styles.accent, { backgroundColor: accentColor }]} />

      {/* Icon bubble */}
      <View style={[styles.iconBubble, { backgroundColor: accentColor + '18' }]}>
        <Text style={styles.icon}>{category?.icon ?? '💸'}</Text>
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>{expense.title}</Text>
        <Text style={styles.meta}>{category?.name ?? 'Uncategorized'} · {formatDate(expense.date)}</Text>
      </View>

      {/* Amount */}
      <Text style={[styles.amount, { color: accentColor }]}>{formatCurrency(expense.amount)}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    marginHorizontal: 20,
    marginVertical: 5,
    overflow: 'hidden',
    gap: 12,
    paddingRight: 16,
    paddingVertical: 14,
  },
  accent: {
    width: 4,
    alignSelf: 'stretch',
    borderRadius: 2,
  },
  iconBubble: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: { fontSize: 20 },
  info: { flex: 1 },
  title: { fontSize: 15, fontWeight: '600', color: Colors.text, marginBottom: 3 },
  meta: { fontSize: 12, color: Colors.textMuted },
  amount: { fontSize: 16, fontWeight: '700' },
});
