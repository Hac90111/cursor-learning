import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { getAuthenticatedUserId } from '@/lib/auth-helpers';

// GET /api/keys/[id] - Get a specific API key for authenticated user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getAuthenticatedUserId(request);

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to access API keys.' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase
      .from('api_keys')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Supabase error:', error);
      
      // If no rows found, it could be because the key doesn't exist or doesn't belong to the user
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'API key not found or you do not have permission to access it' },
          { status: 404 }
        );
      }
      
      // UUID type mismatch error
      if (error.message.includes('invalid input syntax for type uuid') || error.code === '22P02') {
        return NextResponse.json(
          { 
            error: 'Database schema mismatch: The user_id column is UUID type but should be TEXT. Please run the migration SQL to fix this.',
            hint: 'Run migrations/001_fix_api_keys_user_id_type.sql in Supabase SQL Editor'
          },
          { status: 500 }
        );
      }
      
      return NextResponse.json(
        { error: error.message || 'API key not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch API key' },
      { status: 500 }
    );
  }
}

// PUT /api/keys/[id] - Update an API key for authenticated user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getAuthenticatedUserId(request);

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to update API keys.' },
        { status: 401 }
      );
    }

    const { id } = await params;
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

    // First verify the API key belongs to the user
    const supabase = createServerSupabaseClient();
    const { data: existingKey, error: checkError } = await supabase
      .from('api_keys')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (checkError) {
      // UUID type mismatch error
      if (checkError.message.includes('invalid input syntax for type uuid') || checkError.code === '22P02') {
        return NextResponse.json(
          { 
            error: 'Database schema mismatch: The user_id column is UUID type but should be TEXT. Please run the migration SQL to fix this.',
            hint: 'Run migrations/001_fix_api_keys_user_id_type.sql in Supabase SQL Editor'
          },
          { status: 500 }
        );
      }
      
      return NextResponse.json(
        { error: 'API key not found or you do not have permission to update it' },
        { status: 404 }
      );
    }
    
    if (!existingKey) {
      return NextResponse.json(
        { error: 'API key not found or you do not have permission to update it' },
        { status: 404 }
      );
    }

    const updateData: any = {
      name: name.trim(),
    };

    if (type) updateData.type = type;
    if (key) updateData.key = key;
    if (limit_monthly_usage !== undefined) {
      updateData.limit_monthly_usage = limit_monthly_usage;
      updateData.monthly_limit = limit_monthly_usage ? monthly_limit : null;
    }
    if (enable_pii !== undefined) updateData.enable_pii = enable_pii;

    const { data, error: updateError } = await supabase
      .from('api_keys')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('Supabase update error:', updateError);
      
      let errorMessage = updateError.message || 'Failed to update API key in database';
      let statusCode = 400;
      let hint: string | undefined;
      
      if (updateError.message.includes('invalid input syntax for type uuid') || updateError.code === '22P02') {
        errorMessage = 'Database schema mismatch: The user_id column is UUID type but should be TEXT. Please run the migration SQL to fix this.';
        statusCode = 500;
        hint = 'Run migrations/001_fix_api_keys_user_id_type.sql in Supabase SQL Editor';
      }
      
      return NextResponse.json(
        { 
          error: errorMessage,
          code: updateError.code,
          hint
        },
        { status: statusCode }
      );
    }

    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update API key' },
      { status: 500 }
    );
  }
}

// DELETE /api/keys/[id] - Delete an API key for authenticated user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getAuthenticatedUserId(request);

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to delete API keys.' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const supabase = createServerSupabaseClient();

    // First verify the API key belongs to the user
    const { data: existingKey, error: checkError } = await supabase
      .from('api_keys')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (checkError) {
      // UUID type mismatch error
      if (checkError.message.includes('invalid input syntax for type uuid') || checkError.code === '22P02') {
        return NextResponse.json(
          { 
            error: 'Database schema mismatch: The user_id column is UUID type but should be TEXT. Please run the migration SQL to fix this.',
            hint: 'Run migrations/001_fix_api_keys_user_id_type.sql in Supabase SQL Editor'
          },
          { status: 500 }
        );
      }
      
      return NextResponse.json(
        { error: 'API key not found or you do not have permission to delete it' },
        { status: 404 }
      );
    }
    
    if (!existingKey) {
      return NextResponse.json(
        { error: 'API key not found or you do not have permission to delete it' },
        { status: 404 }
      );
    }

    const { error } = await supabase
      .from('api_keys')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('Supabase delete error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to delete API key from database' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'API key deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete API key' },
      { status: 500 }
    );
  }
}

