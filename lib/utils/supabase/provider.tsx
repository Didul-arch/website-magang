"use client";

import React, { useEffect } from "react";
import { createClient } from "./client";
import { Session, User } from "@supabase/supabase-js";
import axiosInstance from "@/lib/axios";
import { useStore } from "@/lib/stores/user.store";

export const AuthContext = React.createContext<{
  user: User | null;
  loading: boolean;
}>({
  user: null,
  loading: true,
});

export const AuthContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [loading, setLoading] = React.useState(true);
  const [user, setUser] = React.useState<User | null>(null);
  const setUserStore = useStore((state) => state.setUser);

  useEffect(() => {
    const supabase = createClient();
    // Get initial session and user on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
        if (event === "SIGNED_IN" && session) getUser(session);
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const getUser = async (session: Session) => {
    if (session) {
      try {
        const response = await axiosInstance.get("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });
        console.log("User data fetched:", response.data?.data);
        setUserStore(response.data?.data ?? null);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
