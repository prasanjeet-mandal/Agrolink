const SUGGESTIONS = [
  'How do I sell my produce?',
  'How do I add a product?',
  'How do I buy fresh produce?',
  'How is pricing done?',
  'What is escrow?',
  'When will I get paid?',
  'What are the delivery options?',
  'How does FPO pooling work?',
  'What is the demand forecast?',
  'How do I log in to the demo?',
];

export default function SuggestionChips({ onPick, disabled }) {
  return (
    <div className="flex max-w-md flex-wrap justify-center gap-2">
      {SUGGESTIONS.map((s) => (
        <button
          key={s}
          type="button"
          disabled={disabled}
          onClick={() => onPick(s)}
          className="rounded-full border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary disabled:opacity-50"
        >
          {s}
        </button>
      ))}
    </div>
  );
}