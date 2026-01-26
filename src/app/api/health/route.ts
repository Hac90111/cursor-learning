import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

/**
 * Health check endpoint to verify Supabase connection
 * GET /api/health
 */
export async function GET() {
  try {
    const supabase = createServerSupabaseClient();
    
    // Test the connection by querying a simple table
    const { data, error } = await supabase
      .from('api_keys')
      .select('id')
      .limit(1);

    if (error) {
      // Check if it's a table not found error
      if (error.code === '42P01' || error.message.includes('does not exist')) {
        return NextResponse.json(
          {
            status: 'error',
            message: 'Database table "api_keys" does not exist. Please run the SQL schema from supabase-schema.sql in your Supabase SQL Editor.',
            error: error.message,
          },
          { status: 503 }
        );
      }

      // Check for RLS policy issues
      if (error.code === '42501' || error.message.includes('permission denied')) {
        return NextResponse.json(
          {
            status: 'error',
            message: 'Row Level Security (RLS) policy is blocking access. Please check your RLS policies in Supabase.',
            error: error.message,
          },
          { status: 403 }
        );
      }

      return NextResponse.json(
        {
          status: 'error',
          message: 'Supabase connection error',
          error: error.message,
          code: error.code,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: 'ok',
      message: 'Supabase connection successful',
      tableExists: true,
      recordCount: data?.length ?? 0,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to connect to Supabase',
        error: error.message,
        hint: 'Please check your NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local',
      },
      { status: 500 }
    );
  }
}











