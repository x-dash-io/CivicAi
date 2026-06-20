import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createServerSupabaseClient();
    const { id } = await params;

    const { data: policy, error } = await supabase
      .from('policies')
      .select('*, category:categories(name), feedback_count:feedback(count)')
      .eq('id', id)
      .not('published_at', 'is', null)
      .eq('status', 'ready')
      .single();

    if (error || !policy) {
      return NextResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: 'The requested policy document does not exist.',
            status: 404,
          },
        },
        { status: 404 }
      );
    }

    const feedbackCount = policy.feedback_count?.[0]?.count ?? 0;

    return NextResponse.json({
      id: policy.id,
      title: policy.title,
      ministry: policy.ministry,
      category: policy.category?.name ?? null,
      description: policy.description ?? '',
      summary: policy.summary,
      audio_url: policy.audio_url,
      document_url: policy.document_url,
      status: policy.status,
      published_at: policy.published_at,
      effective_date: policy.effective_date,
      created_at: policy.created_at,
      feedback_count: feedbackCount,
    });
  } catch {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred', status: 500 } },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient();

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'No valid session', status: 401 } },
        { status: 401 }
      );
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Insufficient permissions', status: 403 } },
        { status: 403 }
      );
    }

    const { id } = await params;

    const { data: existing } = await supabase.from('policies').select('id').eq('id', id).single();

    if (!existing) {
      return NextResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: 'The requested policy document does not exist.',
            status: 404,
          },
        },
        { status: 404 }
      );
    }

    const { error } = await supabase.from('policies').delete().eq('id', id);

    if (error) {
      return NextResponse.json(
        { error: { code: 'INTERNAL_ERROR', message: 'Failed to delete policy', status: 500 } },
        { status: 500 }
      );
    }

    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred', status: 500 } },
      { status: 500 }
    );
  }
}
