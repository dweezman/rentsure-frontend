import { router, type Href } from 'expo-router';
import { useState } from 'react';
import { Switch, View } from 'react-native';

import {
  AppText,
  Avatar,
  Button,
  Card,
  Divider,
  ListRow,
  Screen,
  SectionHeader,
  TextField,
  VerificationBadge,
} from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { useCurrentUser, useStore } from '@/store/app-store';
import { confirm } from '@/utils/dialog';
import { formatDate, isPhone } from '@/utils/format';

type Link = { icon: Parameters<typeof ListRow>[0]['icon']; title: string; subtitle?: string; href: Href };

/** The profile and settings screen. Tenants and landlords both use it. */
export function ProfileView({ links }: { links: Link[] }) {
  const me = useCurrentUser();
  const { actions } = useStore();
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(me.fullName);
  const [phone, setPhone] = useState(me.phone);
  const [rentReminders, setRentReminders] = useState(true);
  const [updates, setUpdates] = useState(true);

  const save = () => {
    if (!fullName.trim() || !isPhone(phone)) return;
    actions.updateProfile({ fullName: fullName.trim(), phone: phone.trim() });
    setEditing(false);
  };

  const logout = async () => {
    if (await confirm('Log out?', 'You can log back in at any time.', 'Log out')) actions.logout();
  };

  return (
    <Screen>
      <Card style={{ alignItems: 'center', gap: Spacing.sm }}>
        <Avatar name={me.fullName} size={72} />
        <AppText variant="title">{me.fullName}</AppText>
        <AppText variant="caption">
          {me.role === 'landlord' ? 'Landlord' : 'Tenant'} · joined {formatDate(me.createdAt)}
        </AppText>
        <VerificationBadge status={me.verificationStatus} subject={me.role === 'landlord' ? 'landlord' : 'identity'} />
      </Card>

      <Card style={{ gap: Spacing.md }}>
        <SectionHeader title="Personal details" actionLabel={editing ? 'Cancel' : 'Edit'} onAction={() => setEditing((e) => !e)} />
        {editing ? (
          <>
            <TextField label="Full name" value={fullName} onChangeText={setFullName} />
            <TextField label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" error={isPhone(phone) ? null : 'Enter a valid phone number.'} />
            <Button title="Save changes" onPress={save} />
          </>
        ) : (
          <View style={{ gap: 4 }}>
            <AppText>{me.email}</AppText>
            <AppText color={Colors.textSecondary}>{me.phone}</AppText>
          </View>
        )}
      </Card>

      <Card padded={false} style={{ paddingHorizontal: Spacing.lg }}>
        {links.map((l, i) => (
          <View key={l.title}>
            {i > 0 && <Divider />}
            <ListRow icon={l.icon} title={l.title} subtitle={l.subtitle} onPress={() => router.push(l.href)} />
          </View>
        ))}
      </Card>

      <Card style={{ gap: Spacing.md }}>
        <SectionHeader title="Reminders" />
        <ToggleRow label={me.role === 'landlord' ? 'Rent due & overdue alerts' : 'Rent due reminders'} value={rentReminders} onChange={setRentReminders} />
        <ToggleRow label="Application & repair updates" value={updates} onChange={setUpdates} />
      </Card>

      <Button title="Log out" variant="danger" icon="log-out-outline" onPress={logout} />
      <Button
        title="Reset demo data"
        variant="ghost"
        size="sm"
        onPress={async () => {
          if (await confirm('Reset demo data?', 'All sample properties, applications and payments go back to how they started.', 'Reset', true)) {
            actions.resetDemoData();
          }
        }}
      />
    </Screen>
  );
}

function ToggleRow({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.md }}>
      <AppText style={{ flex: 1 }}>{label}</AppText>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ true: Colors.primary, false: Colors.border }}
        thumbColor={Colors.surface}
        accessibilityLabel={label}
      />
    </View>
  );
}
