"use client";

export type Choice = { id: string; name: string; hint?: string };

export default function StepChoice({
  choices,
  onPick,
}: {
  choices: Choice[];
  onPick: (choice: Choice) => void;
}) {
  return (
    <div className="space-y-3">
      {choices.map((choice) => (
        <button
          key={choice.id}
          onClick={() => onPick(choice)}
          className="flex w-full items-center justify-between rounded-2xl border border-mist bg-white/70 px-5 py-4 text-left transition-colors hover:border-azure"
        >
          <span className="font-bold">{choice.name}</span>
          {choice.hint && (
            <span className="text-xs text-ink-soft">{choice.hint}</span>
          )}
        </button>
      ))}
    </div>
  );
}
