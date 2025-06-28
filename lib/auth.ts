import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { createServerClient } from "./supabase";
import type { Database } from "./supabase";
import { getServerSession } from "next-auth/next";

export type User = Database["public"]["Tables"]["users"]["Row"];

const serverClient = createServerClient();

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({
      user,
      account,
    }: {
      user: any;
      account: any;
      profile: any;
    }) {
      if (account?.provider === "google") {
        try {
          // Check if user exists in Supabase
          const { data: existingUser, error: fetchError } = await serverClient
            .from("users")
            .select("*")
            .eq("email", user.email!)
            .single();

          if (fetchError && fetchError.code !== "PGRST116") {
            console.error("Error fetching user:", fetchError);
            return false;
          }

          if (!existingUser) {
            // Create new user in Supabase
            const { data: newUser, error: insertError } = await serverClient
              .from("users")
              .insert({
                email: user.email!,
                name: user.name!,
                image: user.image,
                role: "user",
              })
              .select()
              .single();

            if (insertError) {
              console.error("Error creating user:", insertError);
              return false;
            }

            // Store user data in the user object for session
            user.id = newUser.id;
            user.role = newUser.role;
            user.phone = newUser.phone;
            user.address = newUser.address;
          } else {
            // Update existing user with latest Google data
            const { error: updateError } = await serverClient
              .from("users")
              .update({
                name: user.name!,
                image: user.image,
                google_id: user.id,
              })
              .eq("id", existingUser.id);

            if (updateError) {
              console.error("Error updating user:", updateError);
            }

            // Store user data in the user object for session
            user.id = existingUser.id;
            user.role = existingUser.role;
            user.phone = existingUser.phone;
            user.address = existingUser.address;
          }

          return true;
        } catch (error) {
          console.error("Sign in error:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.phone = user.phone;
        token.address = user.address;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
        session.user.phone = token.phone as string;
        session.user.address = token.address as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
  },
};

export async function updateUserProfile(
  userId: string,
  updates: { phone?: string; address?: string }
): Promise<User | null> {
  try {
    const { data, error } = await serverClient
      .from("users")
      .update(updates)
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      console.error("Error updating user profile:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error updating user profile:", error);
    return null;
  }
}

export async function getUserById(id: string): Promise<User | null> {
  try {
    const { data, error } = await serverClient
      .from("users")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching user:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}

export async function getAllUsers(): Promise<User[]> {
  try {
    const { data, error } = await serverClient
      .from("users")
      .select("*")
      .eq("role", "user")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching users:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

export async function getUser(): Promise<User | null> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return null;
    }
    return getUserById(session.user.id);
  } catch (error) {
    console.error("Error getting user:", error);
    return null;
  }
}

