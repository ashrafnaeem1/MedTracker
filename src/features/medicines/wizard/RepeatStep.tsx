import type { Repeat } from "../../../domain/medicine";

interface RepeatStepProps {
  repeat: Repeat;
  onChange: (repeat: Repeat) => void;
}

const OPTIONS = [
  { kind: "daily", title: "Every day", detail: "The same doses every day." },
  { kind: "weekly", title: "Certain days", detail: "Pick the days of the week." },
] as const;

export default function RepeatStep({ repeat, onChange }: RepeatStepProps) {
  return (
    <div style={{ padding: 16, display: "grid", gap: 12 }}>
      {OPTIONS.map((option) => {
        const selected = repeat.kind === option.kind;
        const next: Repeat =
          option.kind === "daily"
            ? { kind: "daily" }
            : { kind: "weekly", days: repeat.kind === "weekly" ? repeat.days : [] };
        return (
          <button
            key={option.kind}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(next)}
            style={{
              minHeight: 64,
              textAlign: "left",
              padding: 16,
              borderRadius: 16,
              border: `2px solid ${selected ? "#111827" : "#d1d5db"}`,
              cursor: "pointer",
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 700 }}>{option.title}</div>
            <div style={{ fontSize: 14, marginTop: 4 }}>{option.detail}</div>
          </button>
        );
      })}
    </div>
  );
}
