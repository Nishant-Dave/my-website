'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, Check, X, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { adminAPI } from '@/lib/api';

interface PendingComment {
  id: number;
  post: number | string;
  name: string;
  email: string;
  body: string;
  created: string;
  is_approved: boolean;
}

export default function ModerationPage() {
  const router = useRouter();
  const [comments, setComments] = useState<PendingComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPendingComments = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await adminAPI.getPendingComments();
      const data = response.data.results || response.data;
      setComments(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Failed to fetch pending comments:', err);
      // Let the axios interceptor handle 401/403
      if (err.response?.status !== 401 && err.response?.status !== 403) {
        setError('Failed to load pending comments. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.replace('/admin-login');
      return;
    }
    fetchPendingComments();
  }, [router]);

  const toggleApproval = async (id: number, currentStatus: boolean) => {
    // Optimistic Update
    const previousComments = [...comments];
    setComments((prev) =>
      prev.map((c) => (c.id === id ? { ...c, is_approved: !currentStatus } : c))
    );

    try {
      await adminAPI.toggleCommentApproval(id);
      // Wait, we probably want to completely remove approved comments 
      // from the pending list if the API returns just pending ones.
      // But keeping it with a visual "Approved" label makes for better UX 
      // if they misclicked and want to quickly undo.
    } catch (err) {
      console.error('Failed to toggle approval:', err);
      // Rollback
      setComments(previousComments);
      alert('Action failed. The comment status has been reverted.');
    }
  };

  if (loading && comments.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-muted-foreground animate-pulse">
        Loading moderation dashboard...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3 text-foreground">
            <ShieldAlert className="text-primary" />
            Comment Moderation
          </h1>
          <p className="text-muted-foreground mt-2">
            Review and manage pending comments from visitors.
          </p>
        </div>
        <Button onClick={fetchPendingComments} variant="outline" disabled={loading}>
          <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh List
        </Button>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 text-red-600 rounded-lg flex items-start gap-3">
          <AlertCircle className="mt-0.5 shrink-0" size={18} />
          <p>{error}</p>
        </div>
      )}

      {comments.length === 0 && !loading && !error && (
        <div className="text-center py-20 border border-dashed border-border rounded-lg bg-card text-muted-foreground">
          <div className="flex justify-center mb-4 text-green-500">
            <Check size={48} />
          </div>
          <p className="text-xl">All caught up!</p>
          <p className="text-sm mt-2">There are no pending comments to review at this time.</p>
        </div>
      )}

      <div className="space-y-4">
        {comments.map((comment) => (
          <div
            key={comment.id}
            className={`p-6 rounded-lg border transition-all ${comment.is_approved
                ? 'bg-green-500/5 border-green-500/20'
                : 'bg-card border-border'
              }`}
          >
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="flex-1 space-y-3">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                  <span className="font-semibold text-foreground text-base">
                    {comment.name}
                  </span>
                  <span className="text-muted-foreground">
                    &lt;{comment.email}&gt;
                  </span>
                  <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                    {new Date(comment.created).toLocaleString()}
                  </span>
                </div>

                <p className="text-foreground/90 whitespace-pre-wrap bg-secondary/30 p-3 rounded-md text-sm">
                  {comment.body}
                </p>

                <div className="text-sm text-muted-foreground">
                  <span className="font-medium mr-2">On Post:</span>
                  {comment.post}
                </div>
              </div>

              <div className="flex md:flex-col gap-3 shrink-0">
                <Button
                  variant={comment.is_approved ? "outline" : "default"}
                  className={`w-full md:w-32 ${comment.is_approved ? 'border-amber-500 text-amber-500 hover:bg-amber-500/10' : 'bg-green-600 hover:bg-green-700'}`}
                  onClick={() => toggleApproval(comment.id, comment.is_approved)}
                >
                  {comment.is_approved ? (
                    <>
                      <X size={16} className="mr-2" />
                      Unapprove
                    </>
                  ) : (
                    <>
                      <Check size={16} className="mr-2" />
                      Approve
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
