import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Only process on initial sign in
      if (account && user) {
        try {
          const supabase = createServerSupabaseClient();
          
          // Check if user already exists
          const { data: existingUser, error: checkError } = await supabase
            .from("users")
            .select("id")
            .eq("email", user.email)
            .single();

          // If user doesn't exist, create them
          if (!existingUser && checkError?.code === "PGRST116") {
            // PGRST116 means no rows returned, so user doesn't exist
            const { error: insertError } = await supabase
              .from("users")
              .insert({
                id: user.id,
                email: user.email,
                name: user.name,
                image: user.image,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              });

            if (insertError) {
              console.error("Error creating user in Supabase:", insertError);
              // Don't block sign in if user creation fails
              // You might want to handle this differently based on your requirements
            }
          } else if (checkError && checkError.code !== "PGRST116") {
            // Some other error occurred
            console.error("Error checking user in Supabase:", checkError);
          }
        } catch (error) {
          console.error("Unexpected error during user creation:", error);
          // Don't block sign in on error
        }
      }
      
      return true; // Allow sign in to proceed
    },
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
          },
        };
      }
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client
      if (session.user) {
        session.user.id = token.user?.id || token.sub || "";
        session.accessToken = token.accessToken as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

