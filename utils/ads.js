// react-native-google-mobile-ads requires a custom dev client / native build
// (it does not run inside Expo Go). We require it lazily and fall back to
// no-ops everywhere so the app keeps working in Expo Go.
let MobileAds, InterstitialAd, RewardedAd, AdEventType, RewardedAdEventType, TestIds;
try {
  const googleMobileAds = require('react-native-google-mobile-ads');
  MobileAds = googleMobileAds.MobileAds;
  InterstitialAd = googleMobileAds.InterstitialAd;
  RewardedAd = googleMobileAds.RewardedAd;
  AdEventType = googleMobileAds.AdEventType;
  RewardedAdEventType = googleMobileAds.RewardedAdEventType;
  TestIds = googleMobileAds.TestIds;
} catch (e) {
  // Native module not available in this runtime (e.g. Expo Go) - use no-ops.
}

const AD_REQUEST_OPTIONS = { requestNonPersonalizedAdsOnly: true };
const INTERSTITIAL_EVERY_N_COMPLETIONS = 5;
const INTERSTITIAL_COOLDOWN_MS = 5 * 60 * 1000;

// 本番広告ユニットID（AdMobコンソールで確認して差し替えてください）
const PROD_INTERSTITIAL_ID = 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX';
const PROD_REWARDED_ID     = 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX';

const INTERSTITIAL_UNIT_ID = __DEV__ ? (TestIds?.INTERSTITIAL ?? PROD_INTERSTITIAL_ID) : PROD_INTERSTITIAL_ID;
const REWARDED_UNIT_ID     = __DEV__ ? (TestIds?.REWARDED     ?? PROD_REWARDED_ID)     : PROD_REWARDED_ID;

let interstitial = null;
let interstitialReady = false;

function loadInterstitial() {
  if (!InterstitialAd) return;
  interstitialReady = false;
  interstitial = InterstitialAd.createForAdRequest(INTERSTITIAL_UNIT_ID, AD_REQUEST_OPTIONS);
  interstitial.addAdEventListener(AdEventType.LOADED, () => {
    interstitialReady = true;
  });
  interstitial.addAdEventListener(AdEventType.CLOSED, () => {
    // Preload the next one so it's ready by the time the next candidate comes up.
    loadInterstitial();
  });
  interstitial.load();
}

export function initializeAds() {
  if (!MobileAds) return;
  MobileAds().initialize().catch(() => {});
  loadInterstitial();
}

export function isInterstitialCandidate(completionCount) {
  return completionCount > 0 && completionCount % INTERSTITIAL_EVERY_N_COMPLETIONS === 0;
}

export function canShowInterstitialNow({ completionCount, lastShownAt, anyModalOpen }) {
  if (anyModalOpen) return false;
  if (!isInterstitialCandidate(completionCount)) return false;
  if (lastShownAt && Date.now() - lastShownAt < INTERSTITIAL_COOLDOWN_MS) return false;
  return true;
}

export function showInterstitialIfReady() {
  if (!InterstitialAd || !interstitial || !interstitialReady) return false;
  interstitialReady = false;
  interstitial.show();
  return true;
}

export function isRewardedAdAvailable() {
  return !!RewardedAd;
}

export function showRewardedAd(onEarned) {
  if (!RewardedAd) {
    onEarned(false);
    return;
  }
  const rewarded = RewardedAd.createForAdRequest(REWARDED_UNIT_ID, AD_REQUEST_OPTIONS);
  let earned = false;
  let settled = false;

  function settle(value) {
    if (settled) return;
    settled = true;
    onEarned(value);
  }

  rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
    rewarded.show().catch(() => settle(false));
  });
  rewarded.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
    earned = true;
  });
  rewarded.addAdEventListener(AdEventType.CLOSED, () => settle(earned));
  rewarded.addAdEventListener(AdEventType.ERROR, () => settle(false));
  rewarded.load();
}
