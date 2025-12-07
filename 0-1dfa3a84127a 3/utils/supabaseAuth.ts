
import { supabase } from '@/app/integrations/supabase/client';

export interface AuthUser {
  id: string;
  email: string;
  role: 'admin' | 'member';
}

export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Sign in error:', error);
      return { success: false, error: error.message };
    }

    if (!data.user) {
      return { success: false, error: 'No user data returned' };
    }

    // Get user profile to check role
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      return { success: false, error: 'Failed to fetch user profile' };
    }

    if (profile.role !== 'admin') {
      await supabase.auth.signOut();
      return { success: false, error: 'Access denied. Admin privileges required.' };
    }

    return { 
      success: true, 
      user: {
        id: data.user.id,
        email: data.user.email || '',
        role: profile.role,
      } as AuthUser
    };
  } catch (error) {
    console.error('Sign in exception:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Sign out error:', error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (error) {
    console.error('Sign out exception:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return null;
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return null;
    }

    return {
      id: user.id,
      email: user.email || '',
      role: profile.role,
    };
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
}
