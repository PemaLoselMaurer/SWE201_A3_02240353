import React, { useEffect } from 'react';
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
import { router } from 'expo-router';
import { useExpenseStore } from '@/store/expenseStore';
import { useCategoryStore } from '@/store/categoryStore';
import { useForm } from '@/hooks/use-form';
import { validateExpense } from '@/utils/validators';
import { FormField } from '@/components/form-field';
import { LoadingSpinner } from '@/components/loading-spinner';
import { Colors, Radius, Shadow } from '@/constants/theme';

export default function CreateExpenseScreen() {
  const addExpense = useExpenseStore((s) => s.addExpense);
  const isLoading = useExpenseStore((s) => s.isLoading);
  const categories = useCategoryStore((s) => s.categories);
  const fetchCategories = useCategoryStore((s) => s.fetchCategories);

  const today = new Date().toISOString().split('T')[0];
  const { values, errors, setField, setFormErrors } = useForm({
    title: '', amount: '', categoryId: '', date: today, notes: '',
  });

  useEffect(() => { fetchCategories(); }, []);

  const handleSubmit = async () => {
    const errs = validateExpense(values);
    if (Object.keys(errs).length > 0) { setFormErrors(errs); return; }
    try {
      await addExpense({
        title: values.title.trim(),
        amount: parseFloat(values.amount),
        categoryId: values.categoryId,
        date: values.date,
        notes: values.notes.trim() || undefined,
      });
      Alert.alert('Saved!', 'Expense has been recorded.', [{ text: 'OK', onPress: () => router.back() }]);
    } catch {
      Alert.alert('Error', 'Could not save expense. Check your connection and try again.');
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Expense</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        {/* Amount input (prominent) */}
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
          <FormField
            label="Title"
            value={values.title}
            onChangeText={(t) => setField('title', t)}
            placeholder="What did you spend on?"
            error={errors.title}
            maxLength={100}
          />
          <FormField
            label="Date"
            value={values.date}
            onChangeText={(t) => setField('date', t)}
            placeholder="YYYY-MM-DD"
            error={errors.date}
          />

          {/* Category picker */}
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

          <FormField
            label="Notes (optional)"
            value={values.notes}
            onChangeText={(t) => setField('notes', t)}
            placeholder="Add a note..."
            multiline
            numberOfLines={3}
            style={styles.notesInput}
          />
        </View>

        {isLoading ? (
          <LoadingSpinner size="large" />
        ) : (
          <TouchableOpacity style={[styles.submitBtn, Shadow.md]} onPress={handleSubmit} activeOpacity={0.85}>
            <Text style={styles.submitText}>Save Expense</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.bg },

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

  scroll: { padding: 20, paddingBottom: 40 },

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

  submitBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    paddingVertical: 17,
    alignItems: 'center',
    marginTop: 4,
  },
  submitText: { color: Colors.textInverse, fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
});
