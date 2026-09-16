import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarActiveTintColor: "#00843D",
        tabBarInactiveTintColor: "#96A19A",

        tabBarStyle: {
          height: 76,
          paddingTop: 8,
          paddingBottom: 10,
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: "#E2E8E4",
          elevation: 10,
        },

        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
        },
      }}
    >
      {/* HOME */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={21}
              color={color}
            />
          ),
        }}
      />

      {/* ASSETS */}
      <Tabs.Screen
        name="assets"
        options={{
          title: "Assets",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "cube" : "cube-outline"}
              size={21}
              color={color}
            />
          ),
        }}
      />

      {/* OPERATIONS */}
      <Tabs.Screen
        name="operations"
        options={{
          title: "Operations",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={
                focused
                  ? "swap-horizontal"
                  : "swap-horizontal-outline"
              }
              size={21}
              color={color}
            />
          ),
        }}
      />

      {/* OUTLET */}
      <Tabs.Screen
        name="outlets"
        options={{
          title: "Outlet",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={
                focused
                  ? "storefront"
                  : "storefront-outline"
              }
              size={21}
              color={color}
            />
          ),
        }}
      />

      {/* REQUESTS */}
      <Tabs.Screen
        name="requests"
        options={{
          title: "Requests",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={
                focused
                  ? "document-text"
                  : "document-text-outline"
              }
              size={21}
              color={color}
            />
          ),
        }}
      />

      {/* PROFILE */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={21}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}