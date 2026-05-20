import React from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import HomeScreen from "./src/screens/HomeScreen";
import CreateStoryScreen from "./src/screens/CreateStoryScreen";
import StoryPreviewScreen from "./src/screens/StoryPreviewScreen";
import StoryLibraryScreen from "./src/screens/StoryLibraryScreen";
import StoryDetailScreen from "./src/screens/StoryDetailScreen";
import AudioPlayerScreen from "./src/screens/AudioPlayerScreen";
import { colors } from "./src/theme";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: colors.background },
            headerShadowVisible: false,
            headerTitleStyle: { color: colors.text, fontWeight: "700" },
            contentStyle: { backgroundColor: colors.background }
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} options={{ title: "Little Story Maker" }} />
          <Stack.Screen name="CreateStory" component={CreateStoryScreen} options={{ title: "Create Story" }} />
          <Stack.Screen name="StoryPreview" component={StoryPreviewScreen} options={{ title: "Story Preview" }} />
          <Stack.Screen name="AudioPlayer" component={AudioPlayerScreen} options={{ title: "Audio Story" }} />
          <Stack.Screen name="StoryLibrary" component={StoryLibraryScreen} options={{ title: "Story Library" }} />
          <Stack.Screen name="StoryDetail" component={StoryDetailScreen} options={{ title: "Story Detail" }} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

