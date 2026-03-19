import { Button as TButton, styled } from "tamagui";

export const Button = styled(TButton, {
  name: "AppButton",
  borderRadius: 12,
  height: 48,
  
  variants: {
    variant: {
      primary: {
        bg: "$accent",
        color: "$white",
        pressStyle: { bg: "$accentPress" },
      },
      secondary: {
        bg: "$backgroundPress",
        color: "$color",
        pressStyle: { bg: "$backgroundHover" },
      },
      outline: {
        bg: "transparent",
        borderWidth: 1,
        borderColor: "$borderColor",
        color: "$color",
        pressStyle: { bg: "$backgroundPress" },
      },
      ghost: {
        bg: "transparent",
        color: "$color",
        pressStyle: { bg: "$backgroundPress" },
      },
      destructive: {
        bg: "$destructive",
        color: "$white",
        pressStyle: { bg: "$destructivePress" },
      },
    },
    size: {
      small: {
        height: 36,
        paddingHorizontal: 12,
      },
      large: {
        height: 56,
        paddingHorizontal: 24,
      },
    },
  } as const,

  defaultVariants: {
    variant: "primary",
  },
});
