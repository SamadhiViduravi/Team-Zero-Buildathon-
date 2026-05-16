type WorkflowTimelineProps = {
  actions?: string[];
};

export function WorkflowTimeline({ actions = [] }: WorkflowTimelineProps) {
  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
        Workflow timeline
      </h2>
      <ol className="mt-3 space-y-2 border-l border-zinc-200 pl-4 dark:border-zinc-700">
        {actions.length === 0 && (
          <li className="text-sm text-zinc-500">No workflow steps to show.</li>
        )}
        {actions.map((action, index) => (
          <li key={`${index}-${action}`} className="text-sm">
            {action}
          </li>
        ))}
      </ol>
    </section>
  );
}
