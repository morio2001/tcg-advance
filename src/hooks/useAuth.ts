import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 現在のセッションを取得
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // 認証状態の変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signInWithOAuth = async (provider: 'google' | 'facebook' | 'twitter') => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: window.location.origin },
    });
    if (error) console.error('Login error:', error.message);
  };

  const signInWithGoogle = () => signInWithOAuth('google');
  const signInWithFacebook = () => signInWithOAuth('facebook');
  const signInWithTwitter = () => signInWithOAuth('twitter');
  const signInWithLine = () => {
    window.location.href = 'https://lowyifjtngxhftnptlzk.supabase.co/functions/v1/line-auth';
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Logout error:', error.message);
  };

  const linkGoogle = async () => {
    await supabase.auth.linkIdentity({ provider: 'google', options: { redirectTo: window.location.origin } });
  };

  const linkTwitter = async () => {
    await supabase.auth.linkIdentity({ provider: 'twitter', options: { redirectTo: window.location.origin } });
  };

  const linkLine = async () => {
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    const token = currentSession?.access_token || '';
    window.location.href = `https://lowyifjtngxhftnptlzk.supabase.co/functions/v1/line-auth?mode=link&access_token=${token}`;
  };

  return { user, session, loading, signInWithGoogle, signInWithFacebook, signInWithTwitter, signInWithLine, signOut, linkGoogle, linkTwitter, linkLine };
}
