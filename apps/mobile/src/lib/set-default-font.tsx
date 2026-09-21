import { Platform, StyleSheet, Text, TextInput } from "react-native";

/**
 * Configures "Inter" as the global default font family for React Native <Text> and <TextInput>
 * on native platforms (iOS & Android).
 *
 * On Web, font inheritance is handled natively via global.css (html, body, #root, *).
 * Touching defaultProps or monkey-patching render on Web injects array-based styles into
 * raw DOM elements (<span>, <input>), which triggers the browser error:
 * "Failed to set an indexed property [0] on 'CSSStyleDeclaration'".
 */
if (Platform.OS !== "web") {
  try {
    const defaultFontStyle = { fontFamily: "Inter" };

    if ((Text as any).defaultProps == null) {
      (Text as any).defaultProps = {};
    }
    (Text as any).defaultProps.style = StyleSheet.flatten([
      defaultFontStyle,
      (Text as any).defaultProps.style,
    ]);

    if ((TextInput as any).defaultProps == null) {
      (TextInput as any).defaultProps = {};
    }
    (TextInput as any).defaultProps.style = StyleSheet.flatten([
      defaultFontStyle,
      (TextInput as any).defaultProps.style,
    ]);
  } catch {
    // Ignored in strict/frozen environments
  }
}
