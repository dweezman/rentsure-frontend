import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { AppText, Banner, Button, Screen, TextField } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { DEMO_LANDLORD_EMAIL, DEMO_TENANT_EMAIL } from '@/data/mock';
import { useStore } from '@/store/app-store';
import { isEmail } from '@/utils/format';

export default function Login() {
  const { actions } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});

  const submit = () => {
    const next: typeof errors = {};
    if (!isEmail(email)) next.email = 'Enter a valid email address.';
    if (password.length < 6) next.password = 'Password must be at least 6 characters.';
    setErrors(next);
    if (Object.keys(next).length) return;
    const err = actions.login(email, password);
    if (err) setErrors({ form: err });
  };

  return (
    <Screen footer={<Button title="Log in" onPress={submit} />}>
      <AppText variant="title">Welcome back</AppText>
      {errors.form && <Banner tone="danger" icon="alert-circle" title={errors.form} />}
      <TextField
        label="Email"
        icon="mail-outline"
        value={email}
        onChangeText={setEmail}
        placeholder="you@example.com"
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
        error={errors.email}
      />
      <TextField
        label="Password"
        icon="lock-closed-outline"
        value={password}
        onChangeText={setPassword}
        placeholder="Your password"
        secureTextEntry
        autoComplete="password"
        error={errors.password}
        onSubmitEditing={submit}
      />
      <View style={{ gap: Spacing.xs }}>
        <AppText variant="caption">
          Demo: {DEMO_TENANT_EMAIL} or {DEMO_LANDLORD_EMAIL} with any 6+ character password.
        </AppText>
      </View>
      <AppText variant="caption" align="center">
        New to RentSure?{' '}
        <AppText variant="label" color={Colors.primary} onPress={() => router.replace('/register')}>
          Create an account
        </AppText>
      </AppText>
    </Screen>
  );
}
