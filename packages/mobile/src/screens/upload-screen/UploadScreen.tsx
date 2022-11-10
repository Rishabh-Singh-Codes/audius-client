import { createNativeStackNavigator } from '@react-navigation/native-stack'

import { useAppScreenOptions } from '../app-screen/useAppScreenOptions'

import { CompleteTrackScreen } from './CompleteTrackScreen'
import { SelectTrackScreen } from './SelectTrackScreen'
import { UploadCompleteScreen } from './UploadCompleteScreen'
import { UploadingTracksScreen } from './UploadingTracksScreen'

const Stack = createNativeStackNavigator()

const screenOptionOverrides = { headerRight: () => null }

export const UploadScreen = () => {
  const screenOptions = useAppScreenOptions(screenOptionOverrides)

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name='SelectTrack' component={SelectTrackScreen} />
      <Stack.Screen
        name='CompleteTrack'
        component={CompleteTrackScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen name='UploadingTracks' component={UploadingTracksScreen} />
      <Stack.Screen name='UploadComplete' component={UploadCompleteScreen} />
    </Stack.Navigator>
  )
}
