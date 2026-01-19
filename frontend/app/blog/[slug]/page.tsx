'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CommentSection } from '@/components/CommentSection';
import { PostDetailSkeleton } from '@/components/LoadingSkeleton';
import { blogAPI, commentsAPI } from '@/lib/api';
import { formatDate } from '@/lib/utils';

interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  publish_date: string;
  categories: any[];
  tags?: string[];
}

interface Comment {
  id: number;
  name: string;
  email: string;
  body: string;
  created: string;
  is_approved: boolean;
  post: number;
}

interface PostDetailProps {
  params: Promise<{ slug: string }>;
}

export default function PostDetailPage({ params }: PostDetailProps) {
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [slug, setSlug] = useState<string>('');

  useEffect(() => {
    params.then((p) => setSlug(p.slug));
  }, [params]);

  useEffect(() => {
    if (!slug) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch post
        const postResponse = await blogAPI.getPostBySlug(slug);
        setPost(postResponse.data);

        // Fetch comments for this post
        const commentsResponse = await commentsAPI.getComments();
        const allComments = Array.isArray(commentsResponse.data)
          ? commentsResponse.data
          : commentsResponse.data.results || [];
        
        // Filter comments for this post
        const postComments = allComments.filter(
          (c: Comment) => c.post === postResponse.data.id || c.post === slug
        );
        setComments(postComments);
      } catch (error) {
        console.error('Failed to fetch post:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <PostDetailSkeleton />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <p className="text-muted-foreground mb-4">Post not found.</p>
        <Link href="/blog">
          <Button>
            <ArrowLeft size={16} className="mr-2" />
            Back to Blog
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <article className="max-w-3xl mx-auto px-4 py-12">
      <Link href="/blog" className="inline-flex items-center gap-2 text-primary hover:underline mb-8">
        <ArrowLeft size={16} />
        Back to Blog
      </Link>

      <header className="mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">
          {post.title}
        </h1>

        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-6 text-muted-foreground">
            <div className="flex items-center gap-2">
              <User size={16} />
              <span>{post.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              <span>{formatDate(post.publish_date)}</span>
            </div>
          </div>

          {post.categories && post.categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.categories.map((cat) => (
                <span
                  key={typeof cat === 'number' ? cat : cat.id}
                  className="inline-block text-xs bg-muted text-muted-foreground px-3 py-1 rounded-full"
                >
                  {typeof cat === 'string' ? cat : (typeof cat === 'number' ? `Category ${cat}` : cat.name)}
                </span>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Post Content */}
      <div className="prose dark:prose-invert max-w-none mb-12">
        <div className="text-foreground leading-relaxed whitespace-pre-wrap">
          {post.content}
        </div>
      </div>

      {post.tags && post.tags.length > 0 && (
        <div className="mb-12 pb-12 border-b border-border">
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="text-sm bg-muted text-muted-foreground px-3 py-1 rounded"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Comments Section */}
      <CommentSection
        postId={post.id}
        comments={comments}
        onCommentAdded={() => {
          // Refetch comments
          const refetchComments = async () => {
            try {
              const response = await commentsAPI.getComments();
              const allComments = Array.isArray(response.data)
                ? response.data
                : response.data.results || [];
              const postComments = allComments.filter(
                (c: Comment) => c.post === post.id || c.post === slug
              );
              setComments(postComments);
            } catch (error) {
              console.error('Failed to refetch comments:', error);
            }
          };
          refetchComments();
        }}
      />
    </article>
  );
}
