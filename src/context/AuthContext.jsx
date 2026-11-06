import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import OneSignal from 'react-onesignal';
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Check kung naay active session inig-load sa app
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchProfile(session.user);
      } else {
        setLoading(false);
      }
    });

    // 2. Listener kung naay login/logout
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchProfile(session.user);
        OneSignal.login(session.user.id);
      } else {
        setUser(null);
        setLoading(false);
        OneSignal.logout();
      }
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  // ✅ FCM Token Logic (Capacitor push notifications)
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      const initPush = async () => {
        let permStatus = await PushNotifications.checkPermissions();
        if (permStatus.receive === 'prompt') {
          permStatus = await PushNotifications.requestPermissions();
        }
        if (permStatus.receive !== 'granted') return;

        await PushNotifications.register();

        PushNotifications.addListener('registration', async (token) => {
          console.log('FCM Token:', token.value);
          if (user) {
            // I-save ang token sa Supabase profiles table
            await supabase.from('profiles').update({ fcm_token: token.value }).eq('id', user.id);
          }
        });
      };
      initPush();
    }
  }, [user]);

  // Function para makuha ang Role (operator/passenger) gikan sa profiles table
  const fetchProfile = async (authUser) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authUser.id)
      .single();

    if (!error && data) {
      setUser({ ...authUser, ...data });
    } else {
      setUser(authUser);
    }
    setLoading(false);
  };

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data.user;
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  // ✅ Upload avatar sa Supabase Storage + update profile
  const uploadAvatar = async (file) => {
    if (!user) throw new Error("No user");

    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}-${Math.random()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: publicUrl })
      .eq("id", user.id);

    if (updateError) throw updateError;

    setUser({ ...user, avatar_url: publicUrl });
    return publicUrl;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, uploadAvatar }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}