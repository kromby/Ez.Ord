import { View, Image, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

import { HelloWave } from "@/components/HelloWave";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { GameButton } from "@/components/GameButton";
import { getTheme } from "@/constants/gameTokens";

export default function Index() {
  const theme = getTheme('fjord');
  const router = useRouter();

  const goToSetup = (game: string) => {
    router.push({ pathname: '/games/setup', params: { game } });
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
        />
      }
    >
      <ThemedText type="title">Byrja nýjan leik</ThemedText>
      <ThemedView style={styles.stepContainer}>
        <HelloWave />
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <GameButton label="TEIKNA" onPress={() => goToSetup('teikna')} theme={theme} />
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <GameButton label="LEIKA" onPress={() => goToSetup('leika')} theme={theme} />
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <GameButton label="ÚTSKÝRA" onPress={() => goToSetup('utskyra')} theme={theme} />
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <GameButton label="ANNAÐ" onPress={() => goToSetup('teikna')} theme={theme} />
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
