import { Platform, StyleSheet, Text, View } from 'react-native';

// react-native-google-mobile-ads requires a custom dev client / native build
// (it does not run inside Expo Go). We require it lazily and fall back to a
// placeholder so the app still works everywhere while staying ready for ads.
let BannerAd, BannerAdSize, TestIds;
try {
  const googleMobileAds = require('react-native-google-mobile-ads');
  BannerAd = googleMobileAds.BannerAd;
  BannerAdSize = googleMobileAds.BannerAdSize;
  TestIds = googleMobileAds.TestIds;
} catch (e) {
  // Native module not available in this runtime (e.g. Expo Go) - use placeholder.
}

// Dummy/test ad unit ID published by Google for development use.
const DUMMY_BANNER_ID = 'ca-app-pub-3940256099942544/6300978111';
// 本番バナー広告ユニットID（AdMobコンソールで確認して差し替えてください）
const PROD_ANDROID_BANNER_ID = 'ca-app-pub-2833241675946579/8413315825';
const PROD_IOS_BANNER_ID = 'ca-app-pub-2833241675946579/7156950187';

function getBannerAdUnitId() {
  if (__DEV__) return TestIds?.BANNER ?? DUMMY_BANNER_ID;
  return Platform.OS === 'ios' ? PROD_IOS_BANNER_ID : PROD_ANDROID_BANNER_ID;
}

export default function AdBanner({ ready }) {
  if (ready && BannerAd) {
    return (
      <View style={styles.container}>
        <BannerAd
          unitId={getBannerAdUnitId()}
          size={BannerAdSize.BANNER}
          requestOptions={{ requestNonPersonalizedAdsOnly: true }}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, styles.placeholder]}>
      <Text style={styles.placeholderText}>広告枠（バナー）</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#EEEFF1',
  },
  placeholder: {
    width: '100%',
    height: 50,
    justifyContent: 'center',
  },
  placeholderText: {
    color: '#AAB0B6',
    fontSize: 12,
  },
});
