'use client';

import React from "react"
import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, ChevronDown } from 'lucide-react';
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

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface PaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Post[];
}

const Loading = () => null;

export default function BlogPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentPage = parseInt(searchParams.get('page') || '1');
  const searchQuery = searchParams.get('search') || '';
  const selectedCategory = searchParams.get('category') || '';
  const sortBy = searchParams.get('sort') || 'newest';

  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    count: 0,
    next: null as string | null,
    previous: null as string | null,
  });

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await blogAPI.getCategories();
        setCategories(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };

    fetchCategories();
  }, []);

  // Fetch posts
  useEffect(() => {
    setLoading(true);
    const fetchPosts = async () => {
      try {
        const params: Record<string, any> = {
          page: currentPage,
        };

        if (searchQuery) {
          params.search = searchQuery;
        }

        if (selectedCategory) {
          params.categories = selectedCategory;
        }

        if (sortBy === 'newest') {
          params.ordering = '-publish_date';
        } else if (sortBy === 'oldest') {
          params.ordering = 'publish_date';
        } else if (sortBy === 'title') {
          params.ordering = 'title';
        }

        const response = await blogAPI.getPosts(params);
        const data: PaginatedResponse = response.data;

        setPosts(data.results || []);
        setPagination({
          count: data.count || 0,
          next: data.next || null,
          previous: data.previous || null,
        });
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [currentPage, searchQuery, selectedCategory, sortBy]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const search = formData.get('search') as string;
    const params = new URLSearchParams();
    params.set('search', search);
    params.set('page', '1');
    router.push(`/blog?${params.toString()}`);
  };

  const handleCategoryChange = (categoryId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (categoryId === '') {
      params.delete('category');
    } else {
      params.set('category', categoryId);
    }
    params.set('page', '1');
    router.push(`/blog?${params.toString()}`);
  };

  const handleSortChange = (sort: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', sort);
    params.set('page', '1');
    router.push(`/blog?${params.toString()}`);
  };

  const handlePageChange = (direction: 'next' | 'previous') => {
    const newPage = direction === 'next' ? currentPage + 1 : currentPage - 1;
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`/blog?${params.toString()}`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-foreground mb-8">Blog</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="lg:w-64 flex-shrink-0">
          {/* Search */}
          <form onSubmit={handleSearch} className="mb-8">
            <div className="relative">
              <Search
                size={20}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
              />
              <input
                type="text"
                name="search"
                defaultValue={searchQuery}
                placeholder="Search posts..."
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <Button type="submit" className="w-full mt-2">
              Search
            </Button>
          </form>

          {/* Categories */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="font-semibold text-foreground mb-4">Categories</h3>
            <div className="space-y-2">
              <button
                onClick={() => handleCategoryChange('')}
                className={`block w-full text-left px-3 py-2 rounded transition-colors ${
                  selectedCategory === ''
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted text-foreground'
                }`}
              >
                All Categories
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryChange(category.id.toString())}
                  className={`block w-full text-left px-3 py-2 rounded transition-colors ${
                    selectedCategory === category.id.toString()
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted text-foreground'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          {/* Sorting */}
          <div className="mb-8 flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Sort by:</span>
            <div className="relative inline-block">
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="appearance-none px-4 py-2 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary pr-8"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="title">Title (A-Z)</option>
              </select>
              <ChevronDown
                size={16}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none text-muted-foreground"
              />
            </div>
          </div>

          {/* Posts Grid */}
          <Suspense fallback={<div>Loading...</div>}>
            {loading ? (
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <PostCardSkeleton key={i} />
                ))}
              </div>
            ) : posts.length > 0 ? (
              <div className="space-y-6">
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
                  No posts found matching your criteria.
                </p>
                <Button
                  variant="outline"
                  onClick={() => router.push('/blog')}
                >
                  Clear filters
                </Button>
              </div>
            )}
          </Suspense>

          {/* Pagination */}
          {!loading && posts.length > 0 && (
            <div className="mt-12 flex gap-4 justify-center">
              <Button
                variant="outline"
                onClick={() => handlePageChange('previous')}
                disabled={!pagination.previous}
              >
                Previous
              </Button>
              <span className="flex items-center text-muted-foreground">
                Page {currentPage}
              </span>
              <Button
                variant="outline"
                onClick={() => handlePageChange('next')}
                disabled={!pagination.next}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
