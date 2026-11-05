import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';

import { AppText, Banner, Button, Screen, TextField } from '@/components/ui';
import { Colors } from '@/constants/theme';
import { useStore } from '@/store/app-store';

const DEMO_CODE = '123456';

export default function Verify() {
  const { currentUser, actions } = useStore();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(30);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  if (!currentUser) return <Redirect href="/welcome" />;

  const submit = () => {
    if (code !== DEMO_CODE) {
      setError('That code is not correct. Check the message and try again.');
      return;
    }
    actions.verifyContact();
  };

  return (
    <Screen
      footer={
        <Button title="Verify" onPress={submit} disabled={code.length !== 6} />
      }>
      <AppText variant="title">Check your email</AppText>
      <AppText color={Colors.textSecondary}>
        We sent a 6-digit code to <AppText variant="bodyStrong">{currentUser.email}</AppText> and{' '}
        {currentUser.phone}. Enter it below to confirm your account.
      </AppText>
      <TextField
        label="Verification code"
        value={code}
        onChangeText={(t) => {
          setError(null);
          setCode(t.replace(/\D/g, '').slice(0, 6));
        }}
        placeholder="••••••"
        keyboardType="number-pad"
        autoComplete="one-time-code"
        maxLength={6}
        error={error}
        style={{ letterSpacing: 8, fontSize: 22 }}
      />
      <Banner tone="info" title={`Demo code: ${DEMO_CODE}`} message="Real codes will come from the backend." />
      <AppText variant="caption" align="center">
        {seconds > 0 ? (
          `You can request a new code in ${seconds}s`
        ) : (
          <AppText variant="label" color={Colors.primary} onPress={() => setSeconds(30)}>
            Resend code
          </AppText>
        )}
      </AppText>
      <Button title="Use a different account" variant="ghost" onPress={actions.logout} />
    </Screen>
  );
}
