import { AppState, Platform } from 'react-native';
import { getTrackingPermissionsAsync, requestTrackingPermissionsAsync } from 'expo-tracking-transparency';

// Apple's review environment can launch the app and evaluate ATT before the
// app's window is actually foregrounded, which silently skips the dialog.
// Waiting for AppState to be "active" plus a short delay avoids that race.
const ACTIVATION_DELAY_MS = 800;

function waitForActiveAppState() {
  if (AppState.currentState === 'active') return Promise.resolve();
  return new Promise((resolve) => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        subscription.remove();
        resolve();
      }
    });
  });
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Resolves once the ATT decision is known (granted, denied, restricted, or
// unavailable). Only requests the dialog when status is still undetermined.
export async function ensureTrackingPermission() {
  if (Platform.OS !== 'ios') return 'unavailable';

  await waitForActiveAppState();
  await delay(ACTIVATION_DELAY_MS);

  const { status } = await getTrackingPermissionsAsync();
  if (status === 'undetermined') {
    const result = await requestTrackingPermissionsAsync();
    return result.status;
  }
  return status;
}
