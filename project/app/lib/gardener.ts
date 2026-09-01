// Shared source of truth for the three "Gardener" companion choices
// The user's chosen Gardener doubles as their profile picture

import type { ImageSourcePropType } from 'react-native';
import { supabase } from '@/app/lib/supabase';

export type GardenerId = 'mateo' | 'maya' | 'leo';

export interface GardenerOption {
    id: GardenerId;
    name: string;
    image: ImageSourcePropType;
}

export const GARDENERS: GardenerOption[] = [
    { id: 'mateo', name: 'Mateo', image: require('@/assets/images/mateo-pfp.png') },
    { id: 'maya', name: 'Maya', image: require('@/assets/images/maya-pfp.png') },
    { id: 'leo', name: 'Leo', image: require('@/assets/images/leo-pfp.png') },
];

export const DEFAULT_GARDENER_ID: GardenerId = 'leo';

export function isGardenerId(value: unknown): value is GardenerId {
    return typeof value === 'string' && GARDENERS.some((gardener) => gardener.id === value);
}

export function getGardenerById(id: GardenerId | null | undefined): GardenerOption {
    return GARDENERS.find((gardener) => gardener.id === id) ?? getGardenerById(DEFAULT_GARDENER_ID);
}

/**
 * Reads the signed-in user's chosen Gardener from Supabase.
 * The choice is stored on `profiles.avatar_url`, reusing that existing
 * column rather than adding a new one. Falls back to the default Gardener
 * if the user has no profile row yet or hasn't picked one.
 */
export async function fetchSelectedGardenerId(): Promise<GardenerId> {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
        return DEFAULT_GARDENER_ID;
    }

    const { data, error } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', userData.user.id)
        .single();

    if (error || !data) {
        return DEFAULT_GARDENER_ID;
    }

    return isGardenerId(data.avatar_url) ? data.avatar_url : DEFAULT_GARDENER_ID;
}

/** Saves the signed-in user's chosen Gardener to Supabase. */
export async function saveSelectedGardenerId(gardenerId: GardenerId): Promise<void> {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
        throw userError ?? new Error('You need to be signed in to save your Gardener.');
    }

    const { error } = await supabase.from('profiles').upsert({
        id: userData.user.id,
        avatar_url: gardenerId,
        updated_at: new Date(),
    });

    if (error) {
        throw error;
    }
}