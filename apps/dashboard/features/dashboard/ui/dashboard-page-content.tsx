"use client";

import { Button } from "@workspace/ui/components/button";

export function DashboardPageContent() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="mt-2 text-muted-foreground">
        Welcome to the dashboard.
      </p>
      <Button className="mt-4">Get Started</Button>
    </div>
  );
}
