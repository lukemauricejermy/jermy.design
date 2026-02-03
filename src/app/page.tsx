export default function Home() {
  return (
    <main className="min-h-screen p-8 md:p-24">
      <div className="max-w-2xl space-y-8">
        <h1 className="text-5xl font-semibold tracking-tight">
          Jermy.Design
        </h1>
        <p className="text-lg text-muted-foreground">
          Product Designer — Portfolio coming soon.
        </p>
        <div className="flex gap-4">
          <div className="h-16 w-16 rounded-lg bg-primary"></div>
          <div className="h-16 w-16 rounded-lg bg-secondary border"></div>
          <div className="h-16 w-16 rounded-lg bg-muted"></div>
          <div className="h-16 w-16 rounded-lg bg-destructive"></div>
        </div>
      </div>
    </main>
  );
}