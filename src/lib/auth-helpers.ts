import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { NextRequest } from "next/server";

/**
 * Gets the authenticated user's ID from the session
 * Retrieves email from JWT session and finds corresponding user in Supabase
 * @param request - The Next.js request object
 * @returns Promise resolving to the user_id string, or null if not authenticated
 */
export async function getAuthenticatedUserId(
  request: NextRequest
): Promise<string | null> {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.email) {
      return null;
    }

    const supabase = createServerSupabaseClient();
    const { data: user, error } = await supabase
      .from("users")
      .select("id")
      .eq("email", session.user.email)
      .single();

    if (error || !user) {
      console.error("Error fetching user from Supabase:", error);
      return null;
    }

    return user.id;
  } catch (error) {
    console.error("Error getting authenticated user ID:", error);
    return null;
  }
}

