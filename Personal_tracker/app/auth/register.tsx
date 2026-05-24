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
import { useAuth } from '@/hooks/use-auth';
import { useForm } from '@/hooks/use-form';
import { validateAuth } from '@/utils/validators';
import { FormField } from '@/components/form-field';
import { LoadingSpinner } from '@/components/loading-spinner';
import { Colors, Radius, Shadow } from '@/constants/theme';

export default function RegisterScreen() {
  const { register, isLoading, error, clearError, isAuthenticated } = useAuth();
  const { values, errors, setField, setFormErrors } = useForm({ name: '', email: '', password: '', confirm: '' });

  useEffect(() => {
    if (isAuthenticated) router.replace('/(tabs)');
  }, [isAuthenticated]);

  useEffect(() => {
    if (error) {
      Alert.alert('Registration Failed', error, [{ text: 'OK', onPress: clearError }]);
    }
  }, [error]);

  const handleRegister = async () => {
    const errs = validateAuth({ email: values.email, password: values.password, name: values.name });
    if (values.password !== values.confirm) errs.confirm = 'Passwords do not match';
    if (Object.keys(errs).length > 0) { setFormErrors(errs); return; }
    try { await register(values.name, values.email, values.password); } catch { /* handled */ }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        {/* Hero */}
        <View style={styles.hero}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <View style={styles.logoRing}>
            <View style={styles.logoInner}>
              <Text style={styles.logoIcon}>₿</Text>
            </View>
          </View>
          <Text style={styles.appName}>Join Expense Tracker</Text>
          <Text style={styles.tagline}>Start tracking your expenses today</Text>
        </View>

        {/* Form card */}
        <View style={[styles.card, Shadow.lg]}>
          <Text style={styles.cardTitle}>Create account</Text>
          <Text style={styles.cardSub}>Fill in the details below</Text>

          <FormField label="Full name" value={values.name} onChangeText={(t) => setField('name', t)} placeholder="Tashi Dorji" error={errors.name} />
          <FormField label="Email address" value={values.email} onChangeText={(t) => setField('email', t)} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} error={errors.email} />
          <FormField label="Password" value={values.password} onChangeText={(t) => setField('password', t)} placeholder="Min. 6 characters" secureTextEntry error={errors.password} />
          <FormField label="Confirm password" value={values.confirm} onChangeText={(t) => setField('confirm', t)} placeholder="Re-enter password" secureTextEntry error={errors.confirm} />

          {isLoading ? (
            <LoadingSpinner size="large" />
          ) : (
            <TouchableOpacity style={styles.btn} onPress={handleRegister} activeOpacity={0.85}>
              <Text style={styles.btnText}>Create Account</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.linkRow} onPress={() => router.back()}>
            <Text style={styles.linkText}>Already have an account? </Text>
            <Text style={styles.linkBold}>Sign In</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.primary },
  scroll: { flexGrow: 1 },

  hero: {
    alignItems: 'center',
    paddingTop: 56,
    paddingBottom: 32,
    paddingHorizontal: 24,
  },
  backBtn: { alignSelf: 'flex-start', marginBottom: 20, padding: 4 },
  backText: { color: 'rgba(255,255,255,0.85)', fontSize: 15, fontWeight: '600' },
  logoRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoIcon: { fontSize: 26, color: Colors.primary },
  appName: { fontSize: 26, fontWeight: '800', color: Colors.surface, letterSpacing: -0.5, marginBottom: 4 },
  tagline: { fontSize: 14, color: 'rgba(255,255,255,0.75)' },

  card: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    flex: 1,
    padding: 28,
    paddingBottom: 48,
  },
  cardTitle: { fontSize: 22, fontWeight: '800', color: Colors.text, marginBottom: 4 },
  cardSub: { fontSize: 14, color: Colors.textMuted, marginBottom: 24 },

  btn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  btnText: { color: Colors.textInverse, fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },

  linkRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  linkText: { color: Colors.textMuted, fontSize: 14 },
  linkBold: { color: Colors.primary, fontSize: 14, fontWeight: '700' },
});
