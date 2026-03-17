import { Button as TButton, styled } from "tamagui";

export const Button = styled(TButton, {
  name: "AppButton",
  borderRadius: 12,
  bg: "$accent",
  pressStyle: {
    bg: "$accentPress",
  },
  hoverStyle: {
    bg: "$accentHover",
  },
});
