import { PageSkeleton } from '@/components/shared/LoadingState'

export default function Loading() {
  return (
    <div className="grid min-h-screen place-items-center bg-gradient-to-br from-rose-50 via-white to-rose-100">
      <PageSkeleton />
    </div>
  )
}
