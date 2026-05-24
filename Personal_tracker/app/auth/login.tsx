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

export default function LoginScreen() {
  const { login, isLoading, error, clearError, isAuthenticated } = useAuth();
  const { values, errors, setField, setFormErrors } = useForm({ email: '', password: '' });

  useEffect(() => {
    if (isAuthenticated) router.replace('/(tabs)');
  }, [isAuthenticated]);

  useEffect(() => {
    if (error) {
      Alert.alert('Sign In Failed', error, [{ text: 'OK', onPress: clearError }]);
    }
  }, [error]);

  const handleLogin = async () => {
    const errs = validateAuth({ email: values.email, password: values.password });
    if (Object.keys(errs).length > 0) { setFormErrors(errs); return; }
    try { await login(values.email, values.password); } catch { /* handled via store */ }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        {/* Hero section */}
        <View style={styles.hero}>
          <View style={styles.logoRing}>
            <View style={styles.logoInner}>
              <Text style={styles.logoIcon}>₿</Text>
            </View>
          </View>
          <Text style={styles.appName}>Expense Tracker</Text>
          <Text style={styles.tagline}>Know where your money goes</Text>
        </View>

        {/* Form card */}
        <View style={[styles.card, Shadow.lg]}>
          <Text style={styles.cardTitle}>Welcome back</Text>
          <Text style={styles.cardSub}>Sign in to continue</Text>

          <View style={styles.fields}>
            <FormField
              label="Email address"
              value={values.email}
              onChangeText={(t) => setField('email', t)}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              error={errors.email}
            />
            <FormField
              label="Password"
              value={values.password}
              onChangeText={(t) => setField('password', t)}
              placeholder="Enter your password"
              secureTextEntry
              error={errors.password}
            />
          </View>

          {isLoading ? (
            <LoadingSpinner size="large" />
          ) : (
            <TouchableOpacity style={styles.btn} onPress={handleLogin} activeOpacity={0.85}>
              <Text style={styles.btnText}>Sign In</Text>
            </TouchableOpacity>
          )}

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity style={styles.outlineBtn} onPress={() => router.push('/auth/register')} activeOpacity={0.8}>
            <Text style={styles.outlineBtnText}>Create an account</Text>
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
    paddingTop: 80,
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  logoRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoInner: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoIcon: { fontSize: 32, color: Colors.primary },
  appName: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.surface,
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  tagline: { fontSize: 15, color: 'rgba(255,255,255,0.75)' },

  card: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    flex: 1,
    padding: 28,
    paddingBottom: 48,
  },
  cardTitle: { fontSize: 24, fontWeight: '800', color: Colors.text, marginBottom: 4 },
  cardSub: { fontSize: 14, color: Colors.textMuted, marginBottom: 28 },

  fields: { gap: 0 },

  btn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  btnText: { color: Colors.textInverse, fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },

  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: { fontSize: 13, color: Colors.textMuted, fontWeight: '500' },

  outlineBtn: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: Radius.lg,
    paddingVertical: 15,
    alignItems: 'center',
  },
  outlineBtnText: { color: Colors.primary, fontSize: 15, fontWeight: '700' },
});
