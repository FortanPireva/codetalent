"use client";

import { KanbanBoard } from "./_components/KanbanBoard";

export default function ApplicationsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Applications</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track candidates across your open positions
        </p>
      </div>
      <KanbanBoard />
    </div>
  );
}
