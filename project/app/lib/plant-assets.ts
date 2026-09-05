import type { ImageSourcePropType } from 'react-native';
import type { PlantStage } from '@/app/lib/plant-growth';
import type { PotColorId } from '@/app/lib/pot';

export const PLANT_IMAGES: Record<PotColorId, Record<PlantStage, ImageSourcePropType>> = {
  blue: {
    0: require('@/assets/images/transparent-cactus/Stage_0_-_Blue_Pot.png'),
    0.5: require('@/assets/images/transparent-cactus/Stage_0.5_-_Blue_Pot.png'),
    1: require('@/assets/images/transparent-cactus/Stage_1_-_Blue_Pot.png'),
    2: require('@/assets/images/transparent-cactus/Stage_2_-_Blue_Pot.png'),
    3: require('@/assets/images/transparent-cactus/Stage_3_-_Blue_Pot.png'),
    4: require('@/assets/images/transparent-cactus/Stage_4_-_Blue_Pot.png'),
  },
  gray: {
    0: require('@/assets/images/transparent-cactus/Stage_0_-_gray_Pot.png'),
    0.5: require('@/assets/images/transparent-cactus/Stage_0.5_-_gray_Pot.png'),
    1: require('@/assets/images/transparent-cactus/Stage_1_-_gray_Pot.png'),
    2: require('@/assets/images/transparent-cactus/Stage_2_-_gray_Pot.png'),
    3: require('@/assets/images/transparent-cactus/Stage_3_-_gray_Pot.png'),
    4: require('@/assets/images/transparent-cactus/Stage_4_-_gray_Pot.png'),
  },
  purple: {
    0: require('@/assets/images/transparent-cactus/Stage_0_-_purple_Pot.png'),
    0.5: require('@/assets/images/transparent-cactus/Stage_0.5_-_purple_Pot.png'),
    1: require('@/assets/images/transparent-cactus/Stage_1_-_purple_Pot.png'),
    2: require('@/assets/images/transparent-cactus/Stage_2_-_purple_Pot.png'),
    3: require('@/assets/images/transparent-cactus/Stage_3_-_purple_Pot.png'),
    4: require('@/assets/images/transparent-cactus/Stage_4_-_purple_Pot.png'),
  },
  red: {
    0: require('@/assets/images/transparent-cactus/Stage_0_-_red_Pot.png'),
    0.5: require('@/assets/images/transparent-cactus/Stage_0.5_-_red_Pot.png'),
    1: require('@/assets/images/transparent-cactus/Stage_1_-_red_Pot.png'),
    2: require('@/assets/images/transparent-cactus/Stage_2_-_red_Pot.png'),
    3: require('@/assets/images/transparent-cactus/Stage_3_-_red_Pot.png'),
    4: require('@/assets/images/transparent-cactus/Stage_4_-_red_Pot.png'),
  },
};

export const MY_PLANT_BACKGROUNDS = {
  day: require('@/assets/images/day-background.jpg'),
  sunset: require('@/assets/images/sunset-background.jpg'),
  night: require('@/assets/images/night-background.jpg'),
} as const satisfies Record<'day' | 'sunset' | 'night', ImageSourcePropType>;

export function getPlantImage(potColor: PotColorId, stage: PlantStage) {
  return PLANT_IMAGES[potColor][stage];
}
