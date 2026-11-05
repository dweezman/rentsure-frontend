import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { AppText, Banner, Button, Checkbox, ChipSelect, Screen, TextField } from '@/components/ui';
import { Colors } from '@/constants/theme';
import { useStore } from '@/store/app-store';
import type { Role } from '@/types/models';
import { isEmail, isPhone } from '@/utils/format';

type Errors = Partial<Record<'fullName' | 'email' | 'phone' | 'password' | 'confirm' | 'terms' | 'form', string>>;

export default function Register() {
  const params = useLocalSearchParams<{ role?: Role }>();
  const { actions } = useStore();
  const [role, setRole] = useState<Role>(params.role === 'landlord' ? 'landlord' : 'tenant');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [terms, setTerms] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  const submit = () => {
    const e: Errors = {};
    if (fullName.trim().split(/\s+/).length < 2) e.fullName = 'Enter your first and last name.';
    if (!isEmail(email)) e.email = 'Enter a valid email address.';
    if (!isPhone(phone)) e.phone = 'Enter a valid phone number, e.g. +234 803 000 0000.';
    if (password.length < 8) e.password = 'Use at least 8 characters.';
    if (confirmPw !== password) e.confirm = "Passwords don't match.";
    if (!terms) e.terms = 'Please accept the terms to continue.';
    setErrors(e);
    if (Object.keys(e).length) return;
    const err = actions.register({ role, fullName: fullName.trim(), email, phone: phone.trim() });
    if (err) setErrors({ form: err });
    else router.replace('/verify');
  };

  return (
    <Screen footer={<Button title="Create account" onPress={submit} />}>
      <AppText variant="title">Join RentSure</AppText>
      <AppText variant="label">I am</AppText>
      <ChipSelect
        value={role}
        onChange={setRole}
        options={[
          { value: 'tenant', label: 'Looking to rent' },
          { value: 'landlord', label: 'A landlord / letting a property' },
        ]}
      />
      {errors.form && <Banner tone="danger" icon="alert-circle" title={errors.form} />}
      <TextField label="Full name" required value={fullName} onChangeText={setFullName} placeholder="As shown on your ID" autoComplete="name" error={errors.fullName} />
      <TextField label="Email" required value={email} onChangeText={setEmail} placeholder="you@example.com" autoCapitalize="none" keyboardType="email-address" autoComplete="email" error={errors.email} />
      <TextField label="Phone number" required value={phone} onChangeText={setPhone} placeholder="+234 803 000 0000" keyboardType="phone-pad" autoComplete="tel" error={errors.phone} />
      <TextField label="Password" required value={password} onChangeText={setPassword} secureTextEntry autoComplete="new-password" hint="At least 8 characters." error={errors.password} />
      <TextField label="Confirm password" required value={confirmPw} onChangeText={setConfirmPw} secureTextEntry autoComplete="new-password" error={errors.confirm} />
      <Checkbox
        checked={terms}
        onChange={setTerms}
        label="I agree to the RentSure Terms of Service and Privacy Policy, and confirm the details I give are true."
      />
      {errors.terms && (
        <AppText variant="caption" color={Colors.danger}>
          {errors.terms}
        </AppText>
      )}
    </Screen>
  );
}
