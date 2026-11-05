import { ProfileView } from '@/components/profile-view';
import { useCurrentUser } from '@/store/app-store';
import { verificationMeta } from '@/utils/labels';

export default function LandlordProfile() {
  const me = useCurrentUser();
  return (
    <ProfileView
      links={[
        { icon: 'shield-checkmark-outline', title: 'Landlord verification', subtitle: verificationMeta[me.verificationStatus].label, href: '/landlord/verification' },
        { icon: 'business-outline', title: 'My properties', href: '/landlord/properties' },
        { icon: 'notifications-outline', title: 'Notifications', href: '/landlord/notifications' },
      ]}
    />
  );
}
