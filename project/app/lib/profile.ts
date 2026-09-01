// Handles the "Name" and "Email" fields
// Name is stored in 'profiles.username'. Email lives on Supabase Auth

import { supabase } from '@/app/lib/supabase';

export interface ProfileFields {
    name: string;
    email: string;
}


// Days since user's account was created, counting signup day as day 1
// Pulled from Supabase Auth 'created_at'
export async function fetchGrowingDays(): Promise<number> {
    const { data: userData, error } = await supabase.auth.getUser();
    const createdAt = userData?.user?.created_at;
    if (error || !createdAt) {
        return 0;
    }

    const msPerDay = 1000 * 60 * 60 * 24;
    const daysSinceSignup = Math.floor((Date.now() - new Date(createdAt).getTime()) / msPerDay);
    return Math.max(daysSinceSignup + 1, 1);
}

// Loads in sign-in users name and email.
// Though if the user hasn't set a name yet, it defaults to their email...user can still delete/replace it
export async function fetchProfileFields(): Promise<ProfileFields> {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
        return { name: '', email: '' };
    }

    const email = userData.user.email ?? '';

    const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', userData.user.id)
        .single();

    const storedName = !error && data?.username ? data.username : '';

    return { name: storedName || email, email };
}

// Saves users name to 'profiles.username' and ONLY if it actually changed
// Supabase email-change flow will start
export async function saveProfileFields(fields: ProfileFields): Promise<void> {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
        throw userError ?? new Error('You need to be signed in to save your profile.');
    }

    const { error: profileError } = await supabase.from('profiles').upsert({
        id: userData.user.id,
        username: fields.name,
        updated_at: new Date(),
    });
    if (profileError) {
        throw profileError;
    }

    const trimmedEmail = fields.email.trim();
    if (trimmedEmail && trimmedEmail !== userData.user.email) {
        const { error: emailError } = await supabase.auth.updateUser({ email: trimmedEmail });
        if (emailError) {
            throw emailError;
        }
    }
}
