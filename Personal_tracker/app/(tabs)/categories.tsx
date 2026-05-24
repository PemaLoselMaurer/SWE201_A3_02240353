import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCategoryStore } from '@/store/categoryStore';
import { useExpenseStore } from '@/store/expenseStore';
import { FormField } from '@/components/form-field';
import { LoadingSpinner } from '@/components/loading-spinner';
import { ErrorMessage } from '@/components/error-message';
import { EmptyState } from '@/components/empty-state';
import { Colors, Radius, Shadow } from '@/constants/theme';
import { formatCurrency } from '@/utils/formatters';
import { Category } from '@/utils/types';

const PRESET_COLORS = [
  '#EF4444', '#F97316', '#F59E0B', '#22C55E',
  '#14B8A6', '#3B82F6', '#6366F1', '#8B5CF6',
  '#EC4899', '#64748B', '#0EA5E9', '#10B981',
];
const PRESET_ICONS = ['🍔', '🚗', '🏠', '🛍', '🎮', '💊', '✈️', '📚', '💡', '🎵', '🏋️', '🎁', '☕', '🎓', '💼', '🐾'];

export default function CategoriesScreen() {
  const { categories, isLoading, error, fetchCategories, addCategory, updateCategory, deleteCategory, clearError } = useCategoryStore();
  const expenses = useExpenseStore((s) => s.expenses);

  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [icon, setIcon] = useState(PRESET_ICONS[0]);
  const [nameError, setNameError] = useState('');

  useEffect(() => { fetchCategories(); }, []);

  useEffect(() => {
    if (error) Alert.alert('Error', error, [{ text: 'OK', onPress: clearError }]);
  }, [error]);

  // Per-category stats
  const stats = useMemo(() => {
    const totalAll = expenses.reduce((s, e) => s + e.amount, 0);
    return categories.map((cat) => {
      const catExpenses = expenses.filter((e) => e.categoryId === cat.id);
      const total = catExpenses.reduce((s, e) => s + e.amount, 0);
      return {
        id: cat.id,
        count: catExpenses.length,
        total,
        pct: totalAll > 0 ? total / totalAll : 0,
      };
    });
  }, [categories, expenses]);

  const openCreate = () => {
    setEditing(null); setName(''); setColor(PRESET_COLORS[0]); setIcon(PRESET_ICONS[0]); setNameError('');
    setModalVisible(true);
  };

  const openEdit = (cat: Category) => {
    setEditing(cat); setName(cat.name); setColor(cat.color); setIcon(cat.icon); setNameError('');
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!name.trim()) { setNameError('Name is required'); return; }
    if (name.trim().length < 2) { setNameError('At least 2 characters'); return; }
    setNameError('');
    try {
      if (editing) await updateCategory(editing.id, { name: name.trim(), color, icon });
      else await addCategory({ name: name.trim(), color, icon });
      setModalVisible(false);
    } catch { Alert.alert('Error', 'Could not save category.'); }
  };

  const handleDelete = (cat: Category) => {
    const count = expenses.filter((e) => e.categoryId === cat.id).length;
    Alert.alert(
      'Delete Category',
      `Delete "${cat.name}"?${count > 0 ? `\n\nThis will affect ${count} expense${count > 1 ? 's' : ''}.` : ''}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive',
          onPress: async () => { try { await deleteCategory(cat.id); } catch { Alert.alert('Error', 'Failed to delete.'); } },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Categories</Text>
          <Text style={styles.headerSub}>{categories.length} categories · {expenses.length} expenses</Text>
        </View>
      </View>

      {isLoading && <LoadingSpinner fullScreen />}
      {!isLoading && error && <ErrorMessage message={error} onRetry={fetchCategories} />}
      {!isLoading && !error && categories.length === 0 && (
        <EmptyState message="No categories yet" subMessage='Tap + to create your first category' icon="🏷" />
      )}

      {!isLoading && categories.length > 0 && (
        <FlatList
          data={categories}
          keyExtractor={(c) => c.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const s = stats.find((x) => x.id === item.id) ?? { count: 0, total: 0, pct: 0 };
            return (
              <TouchableOpacity
                style={[styles.catRow, Shadow.sm]}
                activeOpacity={0.75}
                onPress={() => openEdit(item)}
              >
                {/* Left accent */}
                <View style={[styles.rowAccent, { backgroundColor: item.color }]} />

                {/* Icon */}
                <View style={[styles.rowIcon, { backgroundColor: item.color + '18' }]}>
                  <Text style={styles.rowEmoji}>{item.icon}</Text>
                </View>

                {/* Info */}
                <View style={styles.rowInfo}>
                  <View style={styles.rowTopLine}>
                    <Text style={styles.rowName} numberOfLines={1}>{item.name}</Text>
                    <Text style={[styles.rowTotal, { color: item.color }]}>{formatCurrency(s.total)}</Text>
                  </View>
                  <View style={styles.rowBottomLine}>
                    <Text style={styles.rowCount}>{s.count} expense{s.count !== 1 ? 's' : ''}</Text>
                    <Text style={styles.rowPct}>{Math.round(s.pct * 100)}% of total</Text>
                  </View>
                  {/* Spending bar */}
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { width: `${Math.round(s.pct * 100)}%` as any, backgroundColor: item.color }]} />
                  </View>
                </View>

                {/* Delete button */}
                <TouchableOpacity
                  style={styles.deleteBtn}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  onPress={() => handleDelete(item)}
                >
                  <Text style={styles.deleteBtnText}>🗑</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            );
          }}
        />
      )}

      {/* FAB */}
      <TouchableOpacity style={[styles.fab, Shadow.lg]} onPress={openCreate} activeOpacity={0.85}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      {/* Create / Edit bottom sheet */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView style={styles.sheet} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

            {/* Handle + header */}
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.sheetCancelBtn}>
                <Text style={styles.sheetCancelText}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.sheetTitle}>{editing ? 'Edit Category' : 'New Category'}</Text>
              <TouchableOpacity onPress={handleSave} disabled={isLoading} style={styles.sheetSaveBtn}>
                {isLoading
                  ? <LoadingSpinner size="small" />
                  : <Text style={styles.sheetSaveText}>Save</Text>}
              </TouchableOpacity>
            </View>

            {/* Live preview */}
            <View style={[styles.preview, { backgroundColor: color + '12', borderColor: color + '40' }]}>
              <View style={[styles.previewIconBubble, { backgroundColor: color + '25' }]}>
                <Text style={styles.previewEmoji}>{icon}</Text>
              </View>
              <View style={styles.previewText}>
                <Text style={[styles.previewName, { color }]}>{name || 'Category Name'}</Text>
                <Text style={styles.previewSub}>Tap a color and icon below</Text>
              </View>
              <View style={[styles.previewDot, { backgroundColor: color }]} />
            </View>

            {/* Name */}
            <View style={styles.section}>
              <FormField
                label="Name"
                value={name}
                onChangeText={setName}
                placeholder="e.g. Food & Drink"
                error={nameError}
                maxLength={30}
              />
            </View>

            {/* Color picker */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Color</Text>
              <View style={styles.colorGrid}>
                {PRESET_COLORS.map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={[styles.colorSwatch, { backgroundColor: c }]}
                    onPress={() => setColor(c)}
                    activeOpacity={0.8}
                  >
                    {color === c && (
                      <View style={styles.colorCheckRing}>
                        <Text style={styles.colorCheckMark}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Icon picker */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Icon</Text>
              <View style={styles.iconGrid}>
                {PRESET_ICONS.map((ic) => {
                  const active = icon === ic;
                  return (
                    <TouchableOpacity
                      key={ic}
                      style={[
                        styles.iconBtn,
                        active && { backgroundColor: color + '20', borderColor: color, borderWidth: 2 },
                      ]}
                      onPress={() => setIcon(ic)}
                      activeOpacity={0.75}
                    >
                      <Text style={styles.iconBtnText}>{ic}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Save button (also at bottom for reachability) */}
            <View style={styles.section}>
              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: color }]}
                onPress={handleSave}
                disabled={isLoading}
                activeOpacity={0.85}
              >
                {isLoading
                  ? <LoadingSpinner size="small" color="#fff" />
                  : <Text style={styles.saveBtnText}>{editing ? 'Save Changes' : 'Create Category'}</Text>}
              </TouchableOpacity>
            </View>

          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },

  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  headerTitle: { fontSize: 26, fontWeight: '800', color: Colors.text },
  headerSub: { fontSize: 13, color: Colors.textMuted, marginTop: 3 },

  list: { paddingHorizontal: 20, paddingBottom: 100 },

  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    marginBottom: 10,
    overflow: 'hidden',
    paddingRight: 14,
    paddingVertical: 14,
    gap: 12,
  },
  rowAccent: { width: 4, alignSelf: 'stretch', borderRadius: 2 },
  rowIcon: {
    width: 50,
    height: 50,
    borderRadius: Radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowEmoji: { fontSize: 24 },
  rowInfo: { flex: 1, gap: 4 },
  rowTopLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowName: { fontSize: 15, fontWeight: '700', color: Colors.text, flex: 1, marginRight: 8 },
  rowTotal: { fontSize: 15, fontWeight: '700' },
  rowBottomLine: { flexDirection: 'row', justifyContent: 'space-between' },
  rowCount: { fontSize: 12, color: Colors.textMuted },
  rowPct: { fontSize: 12, color: Colors.textMuted },
  barTrack: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    marginTop: 6,
    overflow: 'hidden',
  },
  barFill: { height: 4, borderRadius: 2, minWidth: 4 },
  deleteBtn: {
    width: 34,
    height: 34,
    borderRadius: Radius.md,
    backgroundColor: '#FFF5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteBtnText: { fontSize: 15 },

  fab: {
    position: 'absolute',
    bottom: 28,
    right: 24,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabIcon: { color: Colors.textInverse, fontSize: 28, fontWeight: '300', lineHeight: 32 },

  // Bottom sheet
  sheet: { flex: 1, backgroundColor: Colors.surface },
  sheetHandle: {
    width: 40, height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: 4,
  },
  sheetCancelBtn: { padding: 4, minWidth: 60 },
  sheetCancelText: { color: Colors.textMuted, fontSize: 15 },
  sheetTitle: { fontSize: 16, fontWeight: '700', color: Colors.text },
  sheetSaveBtn: { padding: 4, minWidth: 60, alignItems: 'flex-end' },
  sheetSaveText: { color: Colors.primary, fontSize: 15, fontWeight: '700' },

  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 4,
    padding: 16,
    borderRadius: Radius.xl,
    borderWidth: 1,
  },
  previewIconBubble: {
    width: 56,
    height: 56,
    borderRadius: Radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewEmoji: { fontSize: 28 },
  previewText: { flex: 1 },
  previewName: { fontSize: 18, fontWeight: '800', marginBottom: 2 },
  previewSub: { fontSize: 12, color: Colors.textMuted },
  previewDot: { width: 10, height: 10, borderRadius: 5 },

  section: { paddingHorizontal: 20, marginTop: 20 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 12,
  },

  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  colorSwatch: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorCheckRing: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 3,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  colorCheckMark: { color: '#fff', fontSize: 16, fontWeight: '800' },

  iconGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  iconBtn: {
    width: 54,
    height: 54,
    borderRadius: Radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.bg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  iconBtnText: { fontSize: 24 },

  saveBtn: {
    borderRadius: Radius.lg,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 8,
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
});
