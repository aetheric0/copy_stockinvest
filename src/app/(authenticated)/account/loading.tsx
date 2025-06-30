import LoadingDots from "@/components/ui/loading-dots";

export default function Loading() {
  return (
    <div className="space-y-6 p-6">
       <div className="min-h-8 flex items-center justify-center">
        <LoadingDots />
      </div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <div className="h-6 w-48 bg-muted rounded" />
          <div className="h-4 w-64 bg-muted rounded" />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="h-10 w-64 bg-muted rounded" />
          <div className="h-10 w-10 bg-muted rounded" />
        </div>
      </div>
      <div className="h-10 w-full bg-muted rounded" />
      {[...Array(10)].map((_, i) => (
        <div key={i} className="h-16 w-full bg-muted rounded" />
      ))}
    </div>
  )
}
