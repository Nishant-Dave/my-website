'use client';

import React from "react"

import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { commentsAPI } from '@/lib/api';
import { formatDate } from '@/lib/utils';

interface Comment {
  id: number;
  name: string;
  email: string;
  body: string;
  created: string;
  is_approved: boolean;
  post?: number | string;
}

interface CommentSectionProps {
  postId: number;
  comments: Comment[];
  onCommentAdded: () => void;
}

export function CommentSection({
  postId,
  comments,
  onCommentAdded,
}: CommentSectionProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    body: '',
  });

  const approvedComments = comments.filter((c) => c.is_approved);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      await commentsAPI.addComment({
        post: postId,
        name: formData.name,
        email: formData.email,
        body: formData.body,
      });

      setFormData({ name: '', email: '', body: '' });
      setSubmitMessage('Comment submitted for review! Thank you.');
      onCommentAdded();

      setTimeout(() => setSubmitMessage(''), 5000);
    } catch (error) {
      setSubmitMessage('Failed to submit comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mt-12 pt-8 border-t border-border">
      <h2 className="text-2xl font-semibold text-foreground mb-6 flex items-center gap-2">
        <MessageCircle size={24} />
        Comments
      </h2>

      {/* Comments List */}
      {approvedComments.length > 0 ? (
        <div className="space-y-4 mb-8">
          {approvedComments.map((comment) => (
            <div
              key={comment.id}
              className="bg-card border border-border rounded-lg p-4"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold text-foreground">{comment.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(comment.created)}
                  </p>
                </div>
              </div>
              <p className="text-foreground text-sm">{comment.body}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm mb-8">
          No comments yet. Be the first to comment!
        </p>
      )}

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Leave a Comment
        </h3>

        {submitMessage && (
          <div
            className={`p-3 rounded mb-4 text-sm ${
              submitMessage.includes('submitted')
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
            }`}
          >
            {submitMessage}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Comment
            </label>
            <textarea
              required
              value={formData.body}
              onChange={(e) =>
                setFormData({ ...formData, body: e.target.value })
              }
              rows={4}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Share your thoughts..."
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Comment'}
          </Button>
        </div>
      </form>
    </section>
  );
}
