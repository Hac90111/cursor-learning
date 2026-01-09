# Supabase Setup Guide

## Step 1: Create a Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Sign up or log in
3. Create a new project
4. Wait for the project to be fully provisioned

## Step 2: Get Your Supabase Credentials

1. Go to your project settings: Project Settings → API
2. Copy the following values:
   - **Project URL** (under "Project URL")
   - **anon/public key** (under "Project API keys")

## Step 3: Set Up Environment Variables

1. Create a `.env.local` file in the root of your project
2. Add the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

Replace `your_project_url_here` and `your_anon_key_here` with your actual values from Step 2.

## Step 4: Create the Database Table

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `supabase-schema.sql`
4. Click **Run** to execute the SQL script

This will create:
- The `api_keys` table with all necessary columns
- Indexes for better performance
- Row Level Security (RLS) policies
- A trigger to automatically update the `updated_at` timestamp

## Step 5: Configure Row Level Security (Optional)

The default policy allows all operations. If you want to add user authentication:

1. Enable authentication in your Supabase project
2. Update the RLS policy in the SQL Editor to use `auth.uid() = user_id`
3. Make sure to set `user_id` when creating API keys

## Step 6: Test the Integration

1. Start your development server: `npm run dev`
2. Navigate to `/dashboard`
3. Try creating, editing, and deleting API keys
4. Check your Supabase dashboard → Table Editor → `api_keys` to see the data

## Troubleshooting

- **Error: Missing Supabase environment variables**: Make sure your `.env.local` file exists and has the correct variable names
- **Error: relation "api_keys" does not exist**: Run the SQL schema file in the Supabase SQL Editor
- **403 Forbidden**: Check your RLS policies in Supabase

