'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, X, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CommentCardSkeleton } from '@/components/LoadingSkeleton';
import { moderationAPI } from '@/lib/api';
import { formatDate } from '@/lib/utils';

interface PendingComment {
  id: number;
  name: string;
  email: string;
  body: string;
  created: string;
  is_approved: boolean;
  post: number | string;
}

export default function ModerationPage() {
  const router = useRouter();
  const [comments, setComments] = useState<PendingComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState<number | null>(null);

  // Check for token on mount
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/admin-login');
      return;
    }

    fetchComments();
  }, [router]);

  const fetchComments = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await moderationAPI.getPendingComments();
      const data = Array.isArray(response.data) ? response.data : response.data.results || [];
      setComments(data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        router.push('/admin-login');
      } else {
        setError('Failed to load pending comments.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggleApprove = async (commentId: number, currentApprovalState: boolean) => {
    setProcessingId(commentId);
    try {
      await moderationAPI.toggleApproveComment(commentId);
      // Update local state
      setComments(
        comments.map((c) =>
          c.id === commentId ? { ...c, is_approved: !currentApprovalState } : c
        )
      );
    } catch (err: any) {
      if (err.response?.status === 401) {
        router.push('/admin-login');
      } else {
        setError('Failed to update comment. Please try again.');
      }
    } finally {
      setProcessingId(null);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchComments();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-foreground mb-8">Moderation</h1>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <CommentCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          Pending Comments
        </h1>
        <Button
          variant="outline"
          size="icon"
          onClick={handleRefresh}
          disabled={refreshing}
          title="Refresh"
        >
          <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
        </Button>
      </div>

      {error && (
        <div className="mb-6 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 p-4 rounded-lg flex items-start gap-3">
          <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-card border border-border rounded-lg p-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                <div>
                  <h3 className="font-semibold text-foreground">
                    {comment.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {comment.email}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Posted on{' '}
                    {typeof comment.post === 'number'
                      ? `Post #${comment.post}`
                      : comment.post}
                    {' '}• {formatDate(comment.created)}
                  </p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button
                    size="sm"
                    onClick={() =>
                      handleToggleApprove(comment.id, comment.is_approved)
                    }
                    disabled={processingId === comment.id}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check size={16} className="mr-1" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() =>
                      handleToggleApprove(comment.id, comment.is_approved)
                    }
                    disabled={processingId === comment.id}
                  >
                    <X size={16} className="mr-1" />
                    Reject
                  </Button>
                </div>
              </div>

              <div className="bg-background border border-border rounded p-4">
                <p className="text-foreground text-sm whitespace-pre-wrap">
                  {comment.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-muted-foreground mb-4">
            No pending comments to moderate.
          </p>
          <Button variant="outline" onClick={handleRefresh}>
            Refresh
          </Button>
        </div>
      )}
    </div>
  );
}
