export function PostCardSkeleton() {
  return (
    <div className="bg-card rounded-lg p-4 space-y-3 animate-pulse">
      <div className="h-6 bg-muted rounded w-3/4" />
      <div className="space-y-2">
        <div className="h-4 bg-muted rounded" />
        <div className="h-4 bg-muted rounded w-5/6" />
      </div>
      <div className="flex justify-between items-center pt-2">
        <div className="h-4 bg-muted rounded w-1/4" />
        <div className="h-4 bg-muted rounded w-1/3" />
      </div>
    </div>
  );
}

export function PostDetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-10 bg-muted rounded w-2/3" />
      <div className="flex gap-4 text-sm">
        <div className="h-4 bg-muted rounded w-1/4" />
        <div className="h-4 bg-muted rounded w-1/4" />
      </div>
      <div className="space-y-3">
        <div className="h-4 bg-muted rounded" />
        <div className="h-4 bg-muted rounded" />
        <div className="h-4 bg-muted rounded w-5/6" />
      </div>
    </div>
  );
}

export function CommentCardSkeleton() {
  return (
    <div className="bg-card rounded-lg p-4 space-y-2 animate-pulse">
      <div className="h-4 bg-muted rounded w-1/3" />
      <div className="h-4 bg-muted rounded w-full" />
      <div className="h-4 bg-muted rounded w-2/3" />
    </div>
  );
}
