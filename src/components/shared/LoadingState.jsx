export function LetterSkeleton() {
  return (
    <div className="mx-auto w-full max-w-2xl rounded-[2rem] bg-white/60 p-12 shadow-2xl ring-1 ring-rose-100">
      <div className="mx-auto h-3 w-24 rounded-full bg-secondary animate-shimmer bg-[linear-gradient(110deg,#e2e8f0_8%,#f1f5f9_18%,#e2e8f0_33%)] bg-[length:200%_100%]" />
      <div className="mt-4 h-10 w-3/4 rounded-md bg-secondary animate-shimmer bg-[linear-gradient(110deg,#e2e8f0_8%,#f1f5f9_18%,#e2e8f0_33%)] bg-[length:200%_100%] mx-auto" />
      <div className="mt-10 space-y-3">
        {[100, 95, 90, 80, 70].map((w, i) => (
          <div
            key={i}
            className="h-4 rounded-md bg-secondary animate-shimmer bg-[linear-gradient(110deg,#e2e8f0_8%,#f1f5f9_18%,#e2e8f0_33%)] bg-[length:200%_100%]"
            style={{ width: `${w}%` }}
          />
        ))}
      </div>
    </div>
  )
}

export function PageSkeleton() {
  return (
    <div className="container py-20">
      <LetterSkeleton />
    </div>
  )
}
