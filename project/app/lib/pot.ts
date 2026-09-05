import type { ImageSourcePropType } from 'react-native';
import { supabase } from '@/app/lib/supabase';

export type PotColorId = 'blue' | 'gray' | 'purple' | 'red';

export interface PotColorOption {
    id: PotColorId;
    label: string;
    image: ImageSourcePropType;
}

// These are the four pot colors with artwork for every current growth stage.
export const POT_COLORS: PotColorOption[] = [
    { id: 'blue', label: 'Blue Pot', image: require('@/assets/images/transparent-cactus/Stage_1_-_Blue_Pot.png') },
    { id: 'gray', label: 'Gray Pot', image: require('@/assets/images/transparent-cactus/Stage_1_-_gray_Pot.png') },
    { id: 'purple', label: 'Purple Pot', image: require('@/assets/images/transparent-cactus/Stage_1_-_purple_Pot.png') },
    { id: 'red', label: 'Red Pot', image: require('@/assets/images/transparent-cactus/Stage_1_-_red_Pot.png') },
];

export const DEFAULT_POT_COLOR_ID: PotColorId = 'blue';

export function isPotColorId(value: unknown): value is PotColorId {
    return typeof value === 'string' && POT_COLORS.some((pot) => pot.id === value);
}

export function normalizePotColorId(value: unknown): PotColorId {
    if (typeof value !== 'string') {
        return DEFAULT_POT_COLOR_ID;
    }

    const normalizedValue = value.trim().toLowerCase();
    const knownValue = normalizedValue === 'grey' ? 'gray' : normalizedValue;
    return isPotColorId(knownValue) ? knownValue : DEFAULT_POT_COLOR_ID;
}

export function getPotColorById(id: PotColorId | null | undefined): PotColorOption {
    return POT_COLORS.find((pot) => pot.id === id) ?? getPotColorById(DEFAULT_POT_COLOR_ID);
}

export async function fetchSelectedPotColorId(): Promise<PotColorId> {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
        return DEFAULT_POT_COLOR_ID;
    }

    const { data, error } = await supabase
        .from('profiles')
        .select('pot_color')
        .eq('id', userData.user.id)
        .single();

    if (error || !data) {
        return DEFAULT_POT_COLOR_ID;
    }

    return normalizePotColorId(data.pot_color);
}

export async function saveSelectedPotColorId(potColorId: PotColorId): Promise<void> {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
        throw userError ?? new Error('You need to be signed in to save your pot color.');
    }

    const { error } = await supabase.from('profiles').upsert({
        id: userData.user.id,
        pot_color: potColorId,
        updated_at: new Date(),
    });

    if (error) {
        throw error;
    }
}
