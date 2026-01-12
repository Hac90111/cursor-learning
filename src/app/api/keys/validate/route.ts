import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

// POST /api/keys/validate - Validate an API key
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { key } = body;

    if (!key || !key.trim()) {
      return NextResponse.json(
        { error: 'API key is required', valid: false },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from('api_keys')
      .select('id, name, type, key')
      .eq('key', key.trim())
      .single();

    if (error || !data) {
      return NextResponse.json(
        { valid: false, error: 'API key is invalid' },
        { status: 200 }
      );
    }

    return NextResponse.json({
      valid: true,
      data: {
        id: data.id,
        name: data.name,
        type: data.type,
      },
    });
  } catch (error: any) {
    console.error('API validation error:', error);
    return NextResponse.json(
      { valid: false, error: error.message || 'Failed to validate API key' },
      { status: 500 }
    );
  }
}

