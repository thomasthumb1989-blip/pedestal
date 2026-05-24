import { StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { BorderRadius, Spacing } from '@/constants/Colors';

type HeaderLogoProps = {
  size?: number;
};

export function HeaderLogo({ size = 28 }: HeaderLogoProps) {
  return (
    <Image
      source={require('@/assets/images/icon.png')}
      style={[
        styles.logo,
        {
          width: size,
          height: size,
          borderRadius: size * 0.2,
        },
      ]}
      contentFit="contain"
    />
  );
}

const styles = StyleSheet.create({
  logo: {
    marginRight: Spacing.md,
  },
});
