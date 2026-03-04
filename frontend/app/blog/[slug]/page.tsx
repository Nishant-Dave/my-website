'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Calendar, User, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { blogAPI } from '@/lib/api';

interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  publish_date: string;
  category: any;
}

interface Comment {
  id: number;
  post: number | string;
  name: string;
  email: string;
  body: string;
  created: string;
  is_approved: boolean;
}

export default function PostDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const router = useRouter();
  const { slug } = use(params);
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Comment Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [body, setBody] = useState('');
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchPostAndComments = async () => {
      try {
        const postRes = await blogAPI.getPostBySlug(slug);
        const postData = postRes.data;
        setPost(postData);

        // Fetch comments by Post ID
        const commentRes = await blogAPI.getComments(postData.id);
        const commentData = commentRes.data.results || commentRes.data; // Handle pagination if DRF paginates this endpoint
        setComments(Array.isArray(commentData) ? commentData : []);
      } catch (err: any) {
        console.error('Failed to fetch post details:', err);
        setError(err.response?.status === 404 ? 'Post not found' : 'An error occurred while loading the post.');
      } finally {
        setLoading(false);
      }
    };

    fetchPostAndComments();
  }, [slug]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post) return;
    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      await blogAPI.addComment({
        post: post.id,
        name,
        email,
        body,
      });
      setSubmitMessage({ type: 'success', text: 'Comment submitted for review' });
      setName('');
      setEmail('');
      setBody('');
    } catch (err) {
      setSubmitMessage({ type: 'error', text: 'Failed to submit comment. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 animate-pulse space-y-6">
        <div className="h-8 w-24 bg-muted rounded"></div>
        <div className="h-12 w-3/4 bg-muted rounded"></div>
        <div className="flex gap-4">
          <div className="h-4 w-32 bg-muted rounded"></div>
          <div className="h-4 w-32 bg-muted rounded"></div>
        </div>
        <div className="space-y-4 mt-8">
          <div className="h-4 bg-muted rounded w-full"></div>
          <div className="h-4 bg-muted rounded w-full"></div>
          <div className="h-4 bg-muted rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-bold mb-4">{error}</h1>
        <Button onClick={() => router.push('/blog')} variant="outline">
          <ChevronLeft size={16} className="mr-2" />
          Back to Blog
        </Button>
      </div>
    );
  }

  const formattedDate = new Date(post.publish_date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <article className="max-w-3xl mx-auto px-4 py-12">
      <Button
        variant="ghost"
        className="mb-8 text-muted-foreground hover:text-foreground"
        onClick={() => router.push('/blog')}
      >
        <ChevronLeft size={16} className="mr-2" />
        Back to Blog
      </Button>

      {/* Post Header */}
      <header className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
          {post.title}
        </h1>
        <div className="flex flex-wrap items-center gap-6 text-muted-foreground text-sm border-b border-border pb-8">
          <span className="flex items-center gap-2">
            <User size={16} />
            {post.author}
          </span>
          <span className="flex items-center gap-2">
            <Calendar size={16} />
            {formattedDate}
          </span>
        </div>
      </header>

      {/* Post Content */}
      <div
        className="prose prose-neutral dark:prose-invert max-w-none 
                   whitespace-pre-wrap text-foreground/90 leading-relaxed mb-16"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* Comments Section */}
      <section className="border-t border-border pt-12">
        <h2 className="text-2xl font-bold flex items-center gap-2 mb-8">
          <MessageCircle size={24} />
          Comments ({comments.length})
        </h2>

        {/* Existing Comments list */}
        <div className="space-y-6 mb-12">
          {comments.length === 0 ? (
            <p className="text-muted-foreground italic">No comments yet. Be the first to share your thoughts!</p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="bg-card p-4 rounded-lg border border-border">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-semibold text-foreground">{comment.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(comment.created).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-foreground/80 whitespace-pre-wrap">{comment.body}</p>
              </div>
            ))
          )}
        </div>

        {/* Comment Form */}
        <div className="bg-secondary/20 p-6 rounded-lg border border-border">
          <h3 className="text-lg font-semibold mb-6">Leave a Reply</h3>

          {submitMessage && (
            <div className={`p-4 rounded-md mb-6 ${submitMessage.type === 'success' ? 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'}`}>
              {submitMessage.text}
            </div>
          )}

          <form onSubmit={handleCommentSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="body">Comment</Label>
              <Textarea
                id="body"
                required
                rows={4}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Share your thoughts..."
              />
            </div>
            <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
              {isSubmitting ? 'Submitting...' : 'Post Comment'}
            </Button>
          </form>
        </div>
      </section>
    </article>
  );
}
