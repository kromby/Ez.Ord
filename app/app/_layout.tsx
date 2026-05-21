import { useEffect } from "react";
import { useColorScheme } from "@/hooks/useColorScheme";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import {
  FamiljenGrotesk_400Regular,
  FamiljenGrotesk_700Bold,
} from "@expo-google-fonts/familjen-grotesk";
import { DMSerifDisplay_400Regular } from "@expo-google-fonts/dm-serif-display";
import { JetBrainsMono_400Regular } from "@expo-google-fonts/jetbrains-mono";
import { GameProvider } from "@/contexts/GameContext";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded, fontError] = useFonts({
    FamiljenGrotesk_400Regular,
    FamiljenGrotesk_700Bold,
    DMSerifDisplay_400Regular,
    JetBrainsMono_400Regular,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GameProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="games" options={{ headerShown: false }} />
        </Stack>
      </ThemeProvider>
    </GameProvider>
  );
}
