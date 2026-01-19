'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PostCard } from '@/components/PostCard';
import { PostCardSkeleton } from '@/components/LoadingSkeleton';
import { blogAPI } from '@/lib/api';

interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  publish_date: string;
  categories: any[];
}

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await blogAPI.getPosts({
          ordering: '-publish_date',
          page: 1,
        });
        // Handle both paginated and non-paginated responses
        const data = response.data.results || response.data;
        setPosts(Array.isArray(data) ? data.slice(0, 3) : []);
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 text-balance">
          Welcome to My Portfolio
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-balance">
          Explore my projects, insights, and thoughts on web development,
          technology, and more.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/blog">
            <Button size="lg">
              Read My Blog
              <ArrowRight size={20} className="ml-2" />
            </Button>
          </Link>
          <Button variant="outline" size="lg">
            View My Projects
          </Button>
        </div>
      </section>

      {/* Featured Posts */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-foreground mb-8">
          Latest Articles
        </h2>

        {loading ? (
          <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <PostCardSkeleton key={i} />
            ))}
          </div>
        ) : posts.length > 0 ? (
          <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                title={post.title}
                slug={post.slug}
                excerpt={post.excerpt}
                content={post.content}
                author={post.author}
                publishDate={post.publish_date}
                categories={post.categories}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              No articles published yet.
            </p>
            <Link href="/blog">
              <Button variant="outline">
                Check back soon
                <ArrowRight size={16} className="ml-2" />
              </Button>
            </Link>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="mt-20 border-t border-border py-8">
        <div className="max-w-4xl mx-auto px-4 text-center text-muted-foreground text-sm">
          <p>© 2026 My Portfolio. Built with Next.js and Django.</p>
        </div>
      </footer>
    </div>
  );
}
