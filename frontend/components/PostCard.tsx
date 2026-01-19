'use client';

import Link from 'next/link';
import { Calendar, User } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface PostCardProps {
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  author: string;
  publishDate: string;
  categories?: Array<{ id: number; name: string }> | number[];
}

export function PostCard({
  title,
  slug,
  excerpt,
  content,
  author,
  publishDate,
  categories = [],
}: PostCardProps) {
  const displayText = excerpt || (content ? content.substring(0, 120) + '...' : '');

  return (
    <Link href={`/blog/${slug}`}>
      <article className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer h-full flex flex-col">
        <h3 className="text-xl font-semibold text-foreground mb-2 line-clamp-2">
          {title}
        </h3>
        
        <p className="text-muted-foreground text-sm mb-4 flex-grow line-clamp-3">
          {displayText}
        </p>

        {categories && categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {categories.map((cat) => (
              <span
                key={typeof cat === 'number' ? cat : cat.id}
                className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded"
              >
                {typeof cat === 'string' ? cat : (typeof cat === 'number' ? `Category ${cat}` : cat.name)}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-4 border-t border-border">
          <div className="flex items-center gap-1">
            <User size={14} />
            <span>{author}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar size={14} />
            <span>{formatDate(publishDate)}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
