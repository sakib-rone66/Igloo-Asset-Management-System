// src/constants/theme.ts

export const Colors = {
  light: {
    background: "#F5F7F6",
    surface: "#FFFFFF",
    surfaceSecondary: "#F0F4F2",

    primary: "#00843D",
    primaryDark: "#006B32",
    primaryLight: "#E5F4EB",

    text: "#17211B",
    textSecondary: "#66736B",
    textMuted: "#96A19A",

    border: "#E2E8E4",

    success: "#159447",
    warning: "#E59B17",
    danger: "#D64545",
    info: "#2778C8",

    white: "#FFFFFF",
    black: "#000000",
    backgroundElement: "#FFFFFF",
    backgroundSelected: "#E5F4EB",
  },

  dark: {
    background: "#101512",
    surface: "#18201B",
    surfaceSecondary: "#202A24",

    primary: "#16A05A",
    primaryDark: "#0D8247",
    primaryLight: "#163D29",

    text: "#F4F7F5",
    textSecondary: "#AAB5AE",
    textMuted: "#77837C",

    border: "#2B352F",

    success: "#2DBB6A",
    warning: "#F0AD2E",
    danger: "#EF5B5B",
    info: "#4D96E8",

    white: "#FFFFFF",
    black: "#000000",
    backgroundElement: "#18201B",
    backgroundSelected: "#163D29",
  },
};

export type ThemeColor = keyof typeof Colors.light;

export const Fonts = {
  mono: "monospace",
};

export const Typography = {
  fontFamily: {
    regular: "System",
    medium: "System",
    semibold: "System",
    bold: "System",
  },

  size: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    xxxl: 30,
    display: 34,
  },

  lineHeight: {
    xs: 16,
    sm: 19,
    md: 22,
    lg: 25,
    xl: 29,
    xxl: 33,
    xxxl: 38,
  },
};

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 12,
  four: 16,
  five: 20,
  six: 24,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
  massive: 48,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  pill: 999,
};

export const Shadows = {
  card: {
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },

  floating: {
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },
};

export const Layout = {
  screenPadding: 20,
  maxContentWidth: 600,
  headerHeight: 64,
  bottomTabHeight: 76,
};

export const MaxContentWidth = Layout.maxContentWidth;
export const BottomTabInset = Layout.bottomTabHeight;

export const AppConfig = {
  name: "Igloo",
  fullName: "Igloo Asset Management",
  version: "1.0.0",
};
