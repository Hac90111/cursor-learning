import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

// GET /api/keys/[id] - Get a specific API key
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase
      .from('api_keys')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Supabase error:', error);
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

// PUT /api/keys/[id] - Update an API key
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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

    const supabase = createServerSupabaseClient();
    const { data, error: updateError } = await supabase
      .from('api_keys')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Supabase update error:', updateError);
      return NextResponse.json(
        { error: updateError.message || 'Failed to update API key in database' },
        { status: 400 }
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

// DELETE /api/keys/[id] - Delete an API key
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createServerSupabaseClient();

    const { error } = await supabase
      .from('api_keys')
      .delete()
      .eq('id', id);

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

