import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Category } from '@/utils/types';
import { Radius } from '@/constants/theme';

interface Props {
  category?: Category;
  small?: boolean;
}

export function CategoryBadge({ category, small = false }: Props) {
  if (!category) return null;
  return (
    <View style={[styles.badge, { backgroundColor: category.color + '18' }]}>
      <Text style={[styles.icon, small && styles.iconSm]}>{category.icon}</Text>
      <Text style={[styles.text, small && styles.textSm, { color: category.color }]}>
        {category.name}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.full,
    gap: 4,
  },
  icon: { fontSize: 14 },
  iconSm: { fontSize: 11 },
  text: { fontSize: 13, fontWeight: '600' },
  textSm: { fontSize: 11 },
});
