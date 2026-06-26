/**
 * ShopSkeleton — the Suspense fallback for the Shop browsing UI (which uses
 * `useSearchParams` and so must sit behind a Suspense boundary). Pure server
 * markup; token-driven; mirrors the sidebar + 2/4-up grid layout so the swap is
 * not jarring.
 */
export function ShopSkeleton() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 pb-16" aria-busy aria-label="Loading products">
      <div className="h-10 border-b border-keyline" />
      <div className="mt-6 lg:flex lg:gap-10">
        <div className="hidden lg:block lg:w-60 lg:shrink-0">
          <div className="h-72 animate-pulse rounded-lg bg-surface-alt/60" />
        </div>
        <div className="grid grow grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4 lg:gap-x-5 lg:gap-y-10">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-3">
              <div className="aspect-square animate-pulse rounded-md bg-surface-alt/60" />
              <div className="h-3 w-2/3 animate-pulse rounded bg-surface-alt/60" />
              <div className="h-3 w-1/3 animate-pulse rounded bg-surface-alt/60" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
