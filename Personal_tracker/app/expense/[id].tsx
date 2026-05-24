import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useExpenseStore } from '@/store/expenseStore';
import { useCategoryStore } from '@/store/categoryStore';
import { useForm } from '@/hooks/use-form';
import { validateExpense } from '@/utils/validators';
import { FormField } from '@/components/form-field';
import { LoadingSpinner } from '@/components/loading-spinner';
import { Colors, Radius, Shadow } from '@/constants/theme';
import { formatCurrency, formatDate } from '@/utils/formatters';

export default function ExpenseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const expenses = useExpenseStore((s) => s.expenses);
  const updateExpense = useExpenseStore((s) => s.updateExpense);
  const deleteExpense = useExpenseStore((s) => s.deleteExpense);
  const isLoading = useExpenseStore((s) => s.isLoading);
  const categories = useCategoryStore((s) => s.categories);
  const getCategoryById = useCategoryStore((s) => s.getCategoryById);

  const expense = expenses.find((e) => e.id === id);
  const [isEditing, setIsEditing] = useState(false);

  const { values, errors, setField, setFormErrors } = useForm({
    title: expense?.title ?? '',
    amount: expense?.amount?.toString() ?? '',
    categoryId: expense?.categoryId ?? '',
    date: expense?.date ?? '',
    notes: expense?.notes ?? '',
  });

  useEffect(() => {
    if (expense) {
      setField('title', expense.title);
      setField('amount', expense.amount.toString());
      setField('categoryId', expense.categoryId);
      setField('date', expense.date);
      setField('notes', expense.notes ?? '');
    }
  }, [expense, setField]);

  if (!expense) {
    return (
      <View style={styles.center}>
        <Text style={styles.notFoundIcon}>🔍</Text>
        <Text style={styles.notFoundText}>Expense not found</Text>
        <TouchableOpacity style={styles.backLink} onPress={() => router.back()}>
          <Text style={styles.backLinkText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const category = getCategoryById(expense.categoryId);
  const accentColor = category?.color ?? Colors.primary;

  const handleUpdate = async () => {
    const errs = validateExpense(values);
    if (Object.keys(errs).length > 0) { setFormErrors(errs); return; }
    try {
      await updateExpense(id, {
        title: values.title.trim(),
        amount: parseFloat(values.amount),
        categoryId: values.categoryId,
        date: values.date,
        notes: values.notes.trim() || undefined,
      });
      setIsEditing(false);
      Alert.alert('Updated', 'Expense saved successfully.');
    } catch {
      Alert.alert('Error', 'Failed to update. Please try again.');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Expense',
      `Delete "${expense.title}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive',
          onPress: async () => {
            try { await deleteExpense(id); router.back(); }
            catch { Alert.alert('Error', 'Failed to delete expense.'); }
          },
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEditing ? 'Edit Expense' : 'Details'}</Text>
        <TouchableOpacity
          style={[styles.editToggleBtn, isEditing && styles.editToggleBtnActive]}
          onPress={() => setIsEditing(!isEditing)}
        >
          <Text style={[styles.editToggleText, isEditing && styles.editToggleTextActive]}>
            {isEditing ? 'Cancel' : 'Edit'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {isEditing ? (
          /* ── Edit mode ── */
          <>
            <View style={styles.amountCard}>
              <Text style={styles.amountLabel}>Amount (BTN)</Text>
              <View style={styles.amountRow}>
                <Text style={styles.currencySign}>Nu.</Text>
                <FormField
                  label=""
                  value={values.amount}
                  onChangeText={(t) => setField('amount', t)}
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                  error={undefined}
                  style={styles.amountInput}
                />
              </View>
              {errors.amount ? <Text style={styles.amountError}>{errors.amount}</Text> : null}
            </View>

            <View style={styles.formCard}>
              <FormField label="Title" value={values.title} onChangeText={(t) => setField('title', t)} placeholder="Expense title" error={errors.title} maxLength={100} />
              <FormField label="Date" value={values.date} onChangeText={(t) => setField('date', t)} placeholder="YYYY-MM-DD" error={errors.date} />

              <Text style={styles.pickerLabel}>Category</Text>
              {errors.categoryId ? <Text style={styles.pickerError}>{errors.categoryId}</Text> : null}
              <View style={styles.categoryGrid}>
                {categories.map((cat) => {
                  const active = values.categoryId === cat.id;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      style={[styles.catItem, { borderColor: active ? cat.color : Colors.border }, active && { backgroundColor: cat.color + '15' }]}
                      onPress={() => setField('categoryId', cat.id)}
                      activeOpacity={0.75}
                    >
                      <View style={[styles.catIcon, { backgroundColor: cat.color + '20' }]}>
                        <Text style={styles.catEmoji}>{cat.icon}</Text>
                      </View>
                      <Text style={[styles.catName, active && { color: cat.color }]} numberOfLines={1}>{cat.name}</Text>
                      {active && <View style={[styles.catCheck, { backgroundColor: cat.color }]}><Text style={styles.catCheckMark}>✓</Text></View>}
                    </TouchableOpacity>
                  );
                })}
              </View>

              <FormField label="Notes (optional)" value={values.notes} onChangeText={(t) => setField('notes', t)} placeholder="Add a note..." multiline numberOfLines={3} style={styles.notesInput} />
            </View>

            {isLoading ? <LoadingSpinner size="large" /> : (
              <TouchableOpacity style={[styles.saveBtn, Shadow.md]} onPress={handleUpdate} activeOpacity={0.85}>
                <Text style={styles.saveBtnText}>Save Changes</Text>
              </TouchableOpacity>
            )}
          </>
        ) : (
          /* ── Detail mode ── */
          <>
            {/* Hero amount card */}
            <View style={[styles.detailHero, { backgroundColor: accentColor }]}>
              <Text style={styles.detailCategory}>{category?.icon} {category?.name ?? 'Uncategorized'}</Text>
              <Text style={styles.detailAmount}>{formatCurrency(expense.amount)}</Text>
              <Text style={styles.detailTitle}>{expense.title}</Text>
            </View>

            {/* Info rows */}
            <View style={[styles.infoCard, Shadow.sm]}>
              <View style={styles.infoRow}>
                <Text style={styles.infoIcon}>📅</Text>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Date</Text>
                  <Text style={styles.infoValue}>{formatDate(expense.date)}</Text>
                </View>
              </View>

              <View style={styles.infoDivider} />

              <View style={styles.infoRow}>
                <Text style={styles.infoIcon}>🏷</Text>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Category</Text>
                  <Text style={[styles.infoValue, { color: accentColor }]}>{category?.icon} {category?.name ?? 'Uncategorized'}</Text>
                </View>
              </View>

              {expense.notes ? (
                <>
                  <View style={styles.infoDivider} />
                  <View style={styles.infoRow}>
                    <Text style={styles.infoIcon}>📝</Text>
                    <View style={styles.infoContent}>
                      <Text style={styles.infoLabel}>Notes</Text>
                      <Text style={styles.infoValue}>{expense.notes}</Text>
                    </View>
                  </View>
                </>
              ) : null}

              <View style={styles.infoDivider} />

              <View style={styles.infoRow}>
                <Text style={styles.infoIcon}>🕐</Text>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Created</Text>
                  <Text style={styles.infoValue}>{formatDate(expense.createdAt)}</Text>
                </View>
              </View>
            </View>

            {isLoading ? <LoadingSpinner size="small" /> : (
              <TouchableOpacity style={[styles.deleteBtn, Shadow.sm]} onPress={handleDelete} activeOpacity={0.8}>
                <Text style={styles.deleteIcon}>🗑</Text>
                <Text style={styles.deleteBtnText}>Delete Expense</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.bg },

  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, backgroundColor: Colors.bg },
  notFoundIcon: { fontSize: 48 },
  notFoundText: { fontSize: 18, fontWeight: '600', color: Colors.text },
  backLink: { marginTop: 4 },
  backLinkText: { color: Colors.primary, fontWeight: '600', fontSize: 15 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.bg, justifyContent: 'center', alignItems: 'center' },
  backIcon: { fontSize: 18, color: Colors.text, fontWeight: '600' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: Colors.text },
  editToggleBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: Radius.full, borderWidth: 1.5, borderColor: Colors.primary },
  editToggleBtnActive: { backgroundColor: Colors.primaryLight },
  editToggleText: { color: Colors.primary, fontWeight: '600', fontSize: 13 },
  editToggleTextActive: { color: Colors.primaryDark },

  scroll: { padding: 20, paddingBottom: 40 },

  // Detail view
  detailHero: {
    borderRadius: Radius.xl,
    padding: 28,
    marginBottom: 16,
    alignItems: 'center',
  },
  detailCategory: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '600', marginBottom: 8 },
  detailAmount: { color: Colors.textInverse, fontSize: 42, fontWeight: '800', letterSpacing: -1, marginBottom: 6 },
  detailTitle: { color: 'rgba(255,255,255,0.9)', fontSize: 16, fontWeight: '600', textAlign: 'center' },

  infoCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: 8,
    marginBottom: 16,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14 },
  infoIcon: { fontSize: 20, width: 28, textAlign: 'center' },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 12, color: Colors.textMuted, fontWeight: '500', marginBottom: 3 },
  infoValue: { fontSize: 15, color: Colors.text, fontWeight: '600' },
  infoDivider: { height: 1, backgroundColor: Colors.border, marginHorizontal: 16 },

  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFF5F5',
    borderRadius: Radius.lg,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: '#FED7D7',
  },
  deleteIcon: { fontSize: 16 },
  deleteBtnText: { color: Colors.danger, fontWeight: '700', fontSize: 15 },

  // Edit view
  amountCard: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.xl,
    padding: 24,
    marginBottom: 16,
  },
  amountLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '500', marginBottom: 8 },
  amountRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  currencySign: { color: 'rgba(255,255,255,0.8)', fontSize: 22, fontWeight: '600', paddingBottom: 2 },
  amountInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 0,
    color: Colors.textInverse,
    fontSize: 32,
    fontWeight: '700',
    paddingVertical: 8,
    borderRadius: Radius.md,
  },
  amountError: { color: '#FFD6D6', fontSize: 12, marginTop: 6 },

  formCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: 20,
    marginBottom: 16,
    ...Shadow.sm,
  },
  pickerLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  pickerError: { color: Colors.danger, fontSize: 12, marginBottom: 8 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  catItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    backgroundColor: Colors.bg,
    minWidth: '45%',
    flex: 1,
  },
  catIcon: { width: 28, height: 28, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  catEmoji: { fontSize: 14 },
  catName: { flex: 1, fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  catCheck: { width: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center' },
  catCheckMark: { color: '#fff', fontSize: 10, fontWeight: '700' },
  notesInput: { minHeight: 80, textAlignVertical: 'top' },

  saveBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    paddingVertical: 17,
    alignItems: 'center',
  },
  saveBtnText: { color: Colors.textInverse, fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
});
