'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Search, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PostCard } from '@/components/PostCard';
import { PostCardSkeleton } from '@/components/LoadingSkeleton';
import { blogAPI } from '@/lib/api';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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

interface Category {
  id: number;
  name: string;
  slug: string;
}

export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination handles
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [ordering, setOrdering] = useState('-publish_date');

  const fetchTimeout = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Fetch categories once
    const fetchCats = async () => {
      try {
        const res = await blogAPI.getCategories();
        setCategories(res.data);
      } catch (e) {
        console.error('Failed to fetch categories:', e);
      }
    };
    fetchCats();
  }, []);

  // Debouncing search
  useEffect(() => {
    if (fetchTimeout.current) {
      clearTimeout(fetchTimeout.current);
    }
    fetchTimeout.current = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1); // reset to page 1 on new search
    }, 500);
    return () => clearTimeout(fetchTimeout.current);
  }, [search]);

  // Refetch when filters or page change
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const params: any = {
          page: currentPage,
          ordering: ordering,
        };

        if (debouncedSearch) {
          params.search = debouncedSearch;
        }

        if (selectedCategory) {
          params.categories = selectedCategory; // Use ID, not slug
        }

        const res = await blogAPI.getPosts(params);

        // Handle DRF PageNumberPagination format
        const data = res.data;
        if (data && data.results !== undefined) {
          setPosts(data.results);
          setHasNext(!!data.next);
          setHasPrev(!!data.previous);
        } else {
          // Fallback if not paginated
          setPosts(Array.isArray(data) ? data : []);
          setHasNext(false);
          setHasPrev(false);
        }
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [currentPage, debouncedSearch, selectedCategory, ordering]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 flex flex-col md:flex-row gap-8">
      {/* Sidebar (Categories & Search for Mobile config) */}
      <aside className="w-full md:w-64 shrink-0 space-y-8">
        <div>
          <h3 className="font-semibold text-lg mb-4 text-foreground">Search</h3>
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              type="text"
              placeholder="Search posts..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-lg mb-4 text-foreground">
            Categories
          </h3>
          <div className="flex flex-wrap md:flex-col gap-2">
            <Button
              variant={selectedCategory === null ? 'default' : 'ghost'}
              className="justify-start w-full"
              onClick={() => {
                setSelectedCategory(null);
                setCurrentPage(1);
              }}
            >
              All Posts
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.id ? 'default' : 'ghost'}
                className="justify-start w-full"
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setCurrentPage(1);
                }}
              >
                {cat.name}
              </Button>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-border pb-4">
          <h1 className="text-3xl font-bold text-foreground">Blog</h1>
          <div className="w-48">
            <Select
              value={ordering}
              onValueChange={(val) => {
                setOrdering(val);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="-publish_date">Newest First</SelectItem>
                <SelectItem value="publish_date">Oldest First</SelectItem>
                <SelectItem value="title">Title (A-Z)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active Filters Display */}
        {(debouncedSearch || selectedCategory) && (
          <div className="flex items-center gap-2 mb-6 flex-wrap">
            <span className="text-sm text-muted-foreground">Showing results for:</span>
            {debouncedSearch && (
              <span className="inline-flex items-center gap-1 bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm">
                "{debouncedSearch}"
                <button onClick={() => setSearch('')} className="hover:text-foreground">
                  <X size={14} />
                </button>
              </span>
            )}
            {selectedCategory && (
              <span className="inline-flex items-center gap-1 bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm">
                Category: {categories.find((c) => c.id === selectedCategory)?.name || '...'}
                <button onClick={() => setSelectedCategory(null)} className="hover:text-foreground">
                  <X size={14} />
                </button>
              </span>
            )}
          </div>
        )}

        {/* Posts Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <PostCardSkeleton key={i} />
            ))}
          </div>
        ) : posts.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                title={post.title}
                slug={post.slug}
                excerpt={post.excerpt}
                content={post.content}
                author={post.author}
                publishDate={post.publish_date}
                categories={post.category ? [post.category] : []}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border border-dashed border-border rounded-lg">
            <p className="text-muted-foreground text-lg mb-2">
              No posts found.
            </p>
            <p className="text-muted-foreground text-sm">
              Try adjusting your search or category filter.
            </p>
            <Button
              variant="outline"
              className="mt-6"
              onClick={() => {
                setSearch('');
                setSelectedCategory(null);
                setOrdering('-publish_date');
              }}
            >
              Clear all filters
            </Button>
          </div>
        )}

        {/* Pagination */}
        {(hasPrev || hasNext) && !loading && (
          <div className="flex items-center justify-between mt-12 pt-6 border-t border-border">
            <Button
              variant="outline"
              onClick={() => setCurrentPage((p) => p - 1)}
              disabled={!hasPrev}
            >
              <ChevronLeft size={16} className="mr-2" />
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage}
            </span>
            <Button
              variant="outline"
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={!hasNext}
            >
              Next
              <ChevronRight size={16} className="ml-2" />
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
