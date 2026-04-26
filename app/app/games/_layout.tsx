import { Stack } from 'expo-router';
import { GameProvider } from '@/contexts/GameContext';

export default function GamesLayout() {
  return (
    <GameProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </GameProvider>
  );
}
