export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-border-custom pb-4">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary font-inter">
          Admin Dashboard
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Overview of system statistics and activity.
        </p>
      </div>
      <div className="rounded-xl border border-dashed border-zinc-300 p-12 text-center bg-white shadow-sm">
        <h2 className="text-lg sm:text-xl font-semibold text-text-primary mb-2">Coming Soon</h2>
        <p className="text-text-secondary text-sm">
          The dashboard content, including policy usage and feedback statistics, is under
          development.
        </p>
      </div>
    </div>
  );
}
