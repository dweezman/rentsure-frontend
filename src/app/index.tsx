import { Redirect } from 'expo-router';

import { useStore } from '@/store/app-store';

/** The first screen. It sends each person to the right part of the app. */
export default function Index() {
  const { currentUser } = useStore();
  if (!currentUser) return <Redirect href="/welcome" />;
  if (!currentUser.contactVerified) return <Redirect href="/verify" />;
  return <Redirect href={currentUser.role === 'landlord' ? '/landlord' : '/tenant'} />;
}
