import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

// GET /api/keys - Fetch all API keys
export async function GET() {
  try {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from('api_keys')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      
      // Provide more specific error messages
      let errorMessage = error.message || 'Failed to fetch API keys from database';
      let statusCode = 400;
      
      if (error.code === '42P01' || error.message.includes('does not exist')) {
        errorMessage = 'Database table "api_keys" does not exist. Please run the SQL schema from supabase-schema.sql in your Supabase SQL Editor.';
        statusCode = 503;
      } else if (error.code === '42501' || error.message.includes('permission denied')) {
        errorMessage = 'Row Level Security (RLS) policy is blocking access. Please check your RLS policies in Supabase.';
        statusCode = 403;
      }
      
      return NextResponse.json(
        { 
          error: errorMessage,
          code: error.code,
          hint: error.code === '42P01' ? 'Run the SQL from supabase-schema.sql in Supabase SQL Editor' : undefined
        },
        { status: statusCode }
      );
    }

    return NextResponse.json({ data: data || [] });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch API keys' },
      { status: 500 }
    );
  }
}

// POST /api/keys - Create a new API key
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, type, key, monthly_limit, limit_monthly_usage, enable_pii } = body;

    // Validation
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    if (type && !['dev', 'prod'].includes(type)) {
      return NextResponse.json(
        { error: 'Type must be either "dev" or "prod"' },
        { status: 400 }
      );
    }

    // Generate key if not provided
    let apiKey = key;
    if (!apiKey) {
      const prefix = type === 'prod' ? 'dattus-prod' : 'himan-dev';
      apiKey = `${prefix}-${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    }

    const newKeyData = {
      name: name.trim(),
      type: type || 'dev',
      usage: 0,
      key: apiKey,
      monthly_limit: limit_monthly_usage ? monthly_limit : null,
      limit_monthly_usage: limit_monthly_usage || false,
      enable_pii: enable_pii || false,
    };

    const supabase = createServerSupabaseClient();
    const { data, error: insertError } = await supabase
      .from('api_keys')
      .insert([newKeyData])
      .select()
      .single();

    if (insertError) {
      console.error('Supabase insert error:', insertError);
      return NextResponse.json(
        { error: insertError.message || 'Failed to create API key in database' },
        { status: 400 }
      );
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create API key' },
      { status: 500 }
    );
  }
}

