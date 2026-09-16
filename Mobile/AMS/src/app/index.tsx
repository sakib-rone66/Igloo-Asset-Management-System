import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  Colors,
  Radius,
  Shadows,
  Spacing,
  Typography,
} from "../constants/theme";

const { width } = Dimensions.get("window");

export default function Index() {
  const handleContinue = () => {
    router.push("/login");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Top brand area */}
        <View style={styles.brandSection}>
          <View style={styles.logoWrapper}>
            <LinearGradient
              colors={[Colors.light.primary, Colors.light.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoBackground}
            >
              <Text style={styles.logoText}>I</Text>
            </LinearGradient>
          </View>

          <Text style={styles.brandName}>IGLOO</Text>

          <Text style={styles.brandSubtitle}>Asset Management System</Text>
        </View>

        {/* Main visual */}
        <View style={styles.heroSection}>
          <View style={styles.heroGlow} />

          <View style={styles.illustrationCard}>
            <View style={styles.illustrationTop}>
              <View style={styles.statusDot} />
              <Text style={styles.illustrationLabel}>ASSET CONTROL</Text>
            </View>

            <View style={styles.freezerShape}>
              <View style={styles.freezerTop}>
                <View style={styles.freezerLogo}>
                  <Text style={styles.freezerLogoText}>IGLOO</Text>
                </View>
              </View>

              <View style={styles.freezerBody}>
                <View style={styles.freezerHandle} />
              </View>

              <View style={styles.freezerBottom}>
                <View style={styles.freezerFoot} />
                <View style={styles.freezerFoot} />
              </View>
            </View>

            <View style={styles.assetBadge}>
              <View style={styles.assetBadgeDot} />
              <Text style={styles.assetBadgeText}>CONNECTED</Text>
            </View>
          </View>
        </View>

        {/* Bottom content */}
        <View style={styles.bottomSection}>
          <Text style={styles.title}>
            Manage your assets.
            {"\n"}
            <Text style={styles.titleAccent}>Anywhere, anytime.</Text>
          </Text>

          <Text style={styles.description}>
            A simple and powerful field app for managing Igloo assets, requests,
            verification and daily operations.
          </Text>

          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.buttonWrapper}
            onPress={handleContinue}
          >
            <LinearGradient
              colors={[Colors.light.primary, Colors.light.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.continueButton}
            >
              <Text style={styles.buttonText}>Continue</Text>

              <View style={styles.arrowCircle}>
                <Text style={styles.arrow}>→</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.footerText}>
            Secure • Professional • Field Ready
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },

  container: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
  },

  brandSection: {
    alignItems: "center",
    paddingTop: Spacing.xl,
  },

  logoWrapper: {
    ...Shadows.card,
    marginBottom: Spacing.sm,
  },

  logoBackground: {
    width: 54,
    height: 54,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },

  logoText: {
    color: Colors.light.white,
    fontSize: 31,
    fontWeight: "800",
    letterSpacing: -1,
  },

  brandName: {
    color: Colors.light.text,
    fontSize: Typography.size.xl,
    fontWeight: "800",
    letterSpacing: 3,
  },

  brandSubtitle: {
    color: Colors.light.textSecondary,
    fontSize: Typography.size.sm,
    marginTop: 3,
  },

  heroSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 300,
  },

  heroGlow: {
    position: "absolute",
    width: width * 0.72,
    height: width * 0.72,
    borderRadius: width,
    backgroundColor: Colors.light.primaryLight,
    opacity: 0.75,
  },

  illustrationCard: {
    width: Math.min(width * 0.76, 310),
    height: 280,
    backgroundColor: Colors.light.surface,
    borderRadius: Radius.xxl,
    padding: Spacing.lg,
    ...Shadows.floating,
    alignItems: "center",
  },

  illustrationTop: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 8,
    backgroundColor: Colors.light.success,
  },

  illustrationLabel: {
    color: Colors.light.textMuted,
    fontSize: Typography.size.xs,
    fontWeight: "700",
    letterSpacing: 1.2,
  },

  freezerShape: {
    width: 128,
    height: 158,
    marginTop: 15,
    alignItems: "center",
  },

  freezerTop: {
    width: 128,
    height: 42,
    borderTopLeftRadius: 13,
    borderTopRightRadius: 13,
    backgroundColor: Colors.light.primary,
    justifyContent: "center",
    alignItems: "center",
  },

  freezerLogo: {
    backgroundColor: "rgba(255,255,255,0.16)",
    paddingHorizontal: 13,
    paddingVertical: 5,
    borderRadius: 8,
  },

  freezerLogoText: {
    color: Colors.light.white,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.5,
  },

  freezerBody: {
    width: 128,
    height: 94,
    backgroundColor: "#E9EEEB",
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderColor: "#D9E0DC",
    alignItems: "flex-end",
    justifyContent: "center",
    paddingRight: 9,
  },

  freezerHandle: {
    width: 5,
    height: 45,
    borderRadius: 5,
    backgroundColor: Colors.light.textMuted,
  },

  freezerBottom: {
    width: 128,
    height: 22,
    backgroundColor: "#D7DED9",
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    alignItems: "flex-end",
  },

  freezerFoot: {
    width: 13,
    height: 8,
    borderRadius: 3,
    backgroundColor: Colors.light.textSecondary,
  },

  assetBadge: {
    marginTop: 15,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: Radius.pill,
  },

  assetBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 6,
    backgroundColor: Colors.light.success,
    marginRight: 6,
  },

  assetBadgeText: {
    color: Colors.light.primaryDark,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },

  bottomSection: {
    paddingBottom: Spacing.lg,
  },

  title: {
    color: Colors.light.text,
    fontSize: Typography.size.xxxl,
    lineHeight: 37,
    fontWeight: "800",
    letterSpacing: -0.7,
  },

  titleAccent: {
    color: Colors.light.primary,
  },

  description: {
    color: Colors.light.textSecondary,
    fontSize: Typography.size.md,
    lineHeight: 22,
    marginTop: Spacing.md,
    maxWidth: 500,
  },

  buttonWrapper: {
    marginTop: Spacing.xl,
    ...Shadows.floating,
  },

  continueButton: {
    height: 60,
    borderRadius: Radius.lg,
    paddingLeft: Spacing.xl,
    paddingRight: 7,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  buttonText: {
    color: Colors.light.white,
    fontSize: Typography.size.md,
    fontWeight: "700",
  },

  arrowCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "rgba(255,255,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
  },

  arrow: {
    color: Colors.light.white,
    fontSize: 23,
    fontWeight: "500",
    marginTop: -2,
  },

  footerText: {
    textAlign: "center",
    color: Colors.light.textMuted,
    fontSize: Typography.size.xs,
    marginTop: Spacing.md,
    letterSpacing: 0.3,
  },
});
