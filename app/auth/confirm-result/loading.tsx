export default function Loading() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-background">
      <div className="w-full max-w-md text-center">
        <div className="h-12 w-12 mx-auto animate-spin rounded-full border-4 border-muted border-t-foreground mb-4" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}
