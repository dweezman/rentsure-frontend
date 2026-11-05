import { Redirect } from 'expo-router';

import { useStore } from '@/store/app-store';

/** Entry point: sends each user to the right place. */
export default function Index() {
  const { currentUser } = useStore();
  if (!currentUser) return <Redirect href="/welcome" />;
  if (!currentUser.contactVerified) return <Redirect href="/verify" />;
  return <Redirect href={currentUser.role === 'landlord' ? '/landlord' : '/tenant'} />;
}
