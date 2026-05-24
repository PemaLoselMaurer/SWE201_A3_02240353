import React, { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useFetchExpenses } from '@/hooks/use-fetch-expenses';
import { useExpenseStore } from '@/store/expenseStore';
import { useCategoryStore } from '@/store/categoryStore';
import { useAuth } from '@/hooks/use-auth';
import { ExpenseCard } from '@/components/expense-card';
import { EmptyState } from '@/components/empty-state';
import { ErrorMessage } from '@/components/error-message';
import { LoadingSpinner } from '@/components/loading-spinner';
import { Colors, Radius, Shadow } from '@/constants/theme';
import { formatCurrency } from '@/utils/formatters';

export default function ExpensesScreen() {
  const { user, logout } = useAuth();
  const { isLoading, error, retry } = useFetchExpenses();
  const expenses = useExpenseStore((s) => s.expenses);
  const filter = useExpenseStore((s) => s.filter);
  const setFilter = useExpenseStore((s) => s.setFilter);
  const categories = useCategoryStore((s) => s.categories);
  const [search, setSearch] = useState('');
  const [profileVisible, setProfileVisible] = useState(false);

  const displayed = useMemo(() => {
    return expenses
      .filter((e) => {
        if (filter.categoryId && e.categoryId !== filter.categoryId) return false;
        return true;
      })
      .filter((e) => e.title.toLowerCase().includes(search.toLowerCase()));
  }, [expenses, filter, search]);

  const total = useMemo(() => displayed.reduce((sum, e) => sum + e.amount, 0), [displayed]);

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <FlatList
        data={displayed}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            {/* Top bar */}
            <View style={styles.topBar}>
              <View>
                <Text style={styles.greeting}>Good day,</Text>
                <Text style={styles.userName}>{user?.name?.split(' ')[0] ?? 'there'} 👋</Text>
              </View>
              <TouchableOpacity style={styles.avatarBtn} onPress={() => setProfileVisible(true)}>
                <Text style={styles.avatarText}>{initials}</Text>
              </TouchableOpacity>
            </View>

            {/* Summary hero card */}
            <View style={[styles.heroCard, Shadow.lg]}>
              <Text style={styles.heroLabel}>Total Expenses</Text>
              <Text style={styles.heroAmount}>{formatCurrency(total)}</Text>
              <View style={styles.heroMeta}>
                <View style={styles.heroMetaItem}>
                  <Text style={styles.heroMetaValue}>{displayed.length}</Text>
                  <Text style={styles.heroMetaLabel}>Transactions</Text>
                </View>
                <View style={styles.heroMetaDivider} />
                <View style={styles.heroMetaItem}>
                  <Text style={styles.heroMetaValue}>{categories.length}</Text>
                  <Text style={styles.heroMetaLabel}>Categories</Text>
                </View>
              </View>
            </View>

            {/* Search */}
            <View style={styles.searchContainer}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Search expenses..."
                value={search}
                onChangeText={setSearch}
                placeholderTextColor={Colors.textMuted}
              />
              {search.length > 0 && (
                <TouchableOpacity onPress={() => setSearch('')}>
                  <Text style={styles.clearSearch}>✕</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Category filter */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsScroll}
            >
              <TouchableOpacity
                style={[styles.chip, !filter.categoryId && styles.chipActive]}
                onPress={() => setFilter({ categoryId: '' })}
              >
                <Text style={[styles.chipText, !filter.categoryId && styles.chipTextActive]}>All</Text>
              </TouchableOpacity>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.chip,
                    filter.categoryId === cat.id && { backgroundColor: cat.color, borderColor: cat.color },
                  ]}
                  onPress={() => setFilter({ categoryId: filter.categoryId === cat.id ? '' : cat.id })}
                >
                  <Text style={[styles.chipText, filter.categoryId === cat.id && styles.chipTextActive]}>
                    {cat.icon} {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Section title */}
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>Transactions</Text>
              <Text style={styles.sectionCount}>{displayed.length} records</Text>
            </View>

            {isLoading && <LoadingSpinner fullScreen />}
            {!isLoading && error && <ErrorMessage message={error} onRetry={retry} />}
          </>
        }
        ListEmptyComponent={
          !isLoading && !error ? (
            <EmptyState
              message="No expenses yet"
              subMessage={search ? 'No results for your search' : 'Tap the + button to add your first expense'}
              icon="💸"
            />
          ) : null
        }
        renderItem={({ item }) => (
          <ExpenseCard
            expense={item}
            category={categories.find((c) => c.id === item.categoryId)}
            onPress={() => router.push(`/expense/${item.id}`)}
          />
        )}
      />

      {/* FAB */}
      <TouchableOpacity style={[styles.fab, Shadow.lg]} onPress={() => router.push('/expense/create')} activeOpacity={0.85}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      {/* Profile modal */}
      <Modal visible={profileVisible} animationType="slide" transparent onRequestClose={() => setProfileVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setProfileVisible(false)}>
          <TouchableOpacity style={[styles.profileSheet, Shadow.lg]} activeOpacity={1}>
            {/* Handle */}
            <View style={styles.sheetHandle} />

            {/* Avatar + name */}
            <View style={styles.profileHero}>
              <View style={styles.profileAvatar}>
                <Text style={styles.profileAvatarText}>{initials}</Text>
              </View>
              <Text style={styles.profileName}>{user?.name}</Text>
              <Text style={styles.profileEmail}>{user?.email}</Text>
            </View>

            {/* Stats */}
            <View style={styles.profileStats}>
              <View style={styles.profileStat}>
                <Text style={styles.profileStatValue}>{expenses.length}</Text>
                <Text style={styles.profileStatLabel}>Expenses</Text>
              </View>
              <View style={styles.profileStatDivider} />
              <View style={styles.profileStat}>
                <Text style={styles.profileStatValue}>{categories.length}</Text>
                <Text style={styles.profileStatLabel}>Categories</Text>
              </View>
              <View style={styles.profileStatDivider} />
              <View style={styles.profileStat}>
                <Text style={styles.profileStatValue}>{formatCurrency(expenses.reduce((s, e) => s + e.amount, 0))}</Text>
                <Text style={styles.profileStatLabel}>Total</Text>
              </View>
            </View>

            {/* Sign out */}
            <TouchableOpacity
              style={styles.signOutBtn}
              activeOpacity={0.8}
              onPress={() => {
                setProfileVisible(false);
                Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Sign Out', style: 'destructive', onPress: logout },
                ]);
              }}
            >
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  listContent: { paddingBottom: 100 },

  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  greeting: { fontSize: 13, color: Colors.textMuted, marginBottom: 2 },
  userName: { fontSize: 20, fontWeight: '800', color: Colors.text },
  avatarBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { color: Colors.textInverse, fontWeight: '700', fontSize: 14 },

  heroCard: {
    backgroundColor: Colors.primary,
    marginHorizontal: 20,
    borderRadius: Radius.xl,
    padding: 24,
    marginBottom: 20,
  },
  heroLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '500', marginBottom: 6 },
  heroAmount: { color: Colors.textInverse, fontSize: 38, fontWeight: '800', letterSpacing: -1, marginBottom: 20 },
  heroMeta: { flexDirection: 'row', alignItems: 'center' },
  heroMetaItem: { flex: 1, alignItems: 'center' },
  heroMetaValue: { color: Colors.textInverse, fontSize: 20, fontWeight: '700', marginBottom: 2 },
  heroMetaLabel: { color: 'rgba(255,255,255,0.65)', fontSize: 12 },
  heroMetaDivider: { width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.2)' },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    marginHorizontal: 20,
    marginBottom: 14,
    paddingHorizontal: 14,
    paddingVertical: 2,
    borderWidth: 1.5,
    borderColor: Colors.border,
    gap: 8,
  },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, fontSize: 15, color: Colors.text, paddingVertical: 11 },
  clearSearch: { fontSize: 14, color: Colors.textMuted, padding: 4 },

  chipsScroll: { paddingHorizontal: 20, paddingBottom: 14, gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  chipTextActive: { color: Colors.textInverse },

  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.text },
  sectionCount: { fontSize: 13, color: Colors.textMuted },

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

  // Profile modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  profileSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: 40,
  },
  sheetHandle: {
    width: 40, height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 24,
  },
  profileHero: { alignItems: 'center', marginBottom: 24 },
  profileAvatar: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: Colors.primary,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 12,
  },
  profileAvatarText: { color: Colors.textInverse, fontSize: 26, fontWeight: '700' },
  profileName: { fontSize: 20, fontWeight: '800', color: Colors.text, marginBottom: 4 },
  profileEmail: { fontSize: 14, color: Colors.textMuted },
  profileStats: {
    flexDirection: 'row',
    backgroundColor: Colors.bg,
    borderRadius: Radius.xl,
    padding: 16,
    marginBottom: 20,
  },
  profileStat: { flex: 1, alignItems: 'center' },
  profileStatValue: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 2 },
  profileStatLabel: { fontSize: 11, color: Colors.textMuted },
  profileStatDivider: { width: 1, backgroundColor: Colors.border },
  signOutBtn: {
    backgroundColor: '#FFF5F5',
    borderRadius: Radius.lg,
    paddingVertical: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FED7D7',
  },
  signOutText: { color: Colors.danger, fontWeight: '700', fontSize: 15 },
});
