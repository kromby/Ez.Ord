import { View, Image, Button, StyleSheet } from "react-native";

import { HelloWave } from "@/components/HelloWave";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

export default function Index() {
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
      <Button title="Teikna" onPress={() => {}} />      
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
      <Button title="Leika" onPress={() => {}} />      
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
      <Button title="Útskýra" onPress={() => {}} />      
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
      <Button title="Annað" onPress={() => {}} />      
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
