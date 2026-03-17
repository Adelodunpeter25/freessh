import { Tabs as TTabs } from "@tamagui/tabs";
import { styled } from "tamagui";

export const Tabs = TTabs;

export const TabsList = styled(TTabs.List, {
  name: "AppTabsList",
  backgroundColor: "$background",
  borderColor: "$borderColor",
  borderWidth: 1,
  borderRadius: 12,
  padding: 4,
});

export const TabsTrigger = styled(TTabs.Tab, {
  name: "AppTabsTrigger",
  borderRadius: 8,
  paddingVertical: 6,
  paddingHorizontal: 10,
  focusStyle: {
    bg: "$borderColor",
  },
  pressStyle: {
    bg: "$borderColor",
  },
});

export const TabsContent = styled(TTabs.Content, {
  name: "AppTabsContent",
  paddingTop: 12,
});
