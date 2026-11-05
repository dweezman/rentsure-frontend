import { ProfileView } from '@/components/profile-view';
import { useCurrentUser } from '@/store/app-store';
import { verificationMeta } from '@/utils/labels';

export default function TenantProfile() {
  const me = useCurrentUser();
  return (
    <ProfileView
      links={[
        { icon: 'id-card-outline', title: 'Identity verification', subtitle: verificationMeta[me.verificationStatus].label, href: '/tenant/verify-identity' },
        { icon: 'flag-outline', title: 'My fraud reports', subtitle: 'Track concerns you have reported', href: '/tenant/reports' },
        { icon: 'notifications-outline', title: 'Notifications', href: '/tenant/notifications' },
      ]}
    />
  );
}
