import type { SlotView } from "../../domain/daySchedule";
import type { RecordedStatus, SlotRef } from "../../domain/doseLog";
import { formatTime } from "../../domain/time";
import { PALETTE } from "./palette";
import { SECTION_PADDING_BOTTOM_PX } from "./layout";
import EmptySchedule from "./EmptySchedule";
import SlotCard from "./SlotCard";

interface TimelineProps {
  slots: SlotView[];
  today: string;
  focusedKey: string | null;
  onEdit: (medicineId: string) => void;
  onAdd: () => void;
  onRecord: (ref: SlotRef, status: RecordedStatus) => void;
  onUndo: (ref: SlotRef) => void;
}

type TimelineSection =
  | { kind: "hour"; hour: number; slots: SlotView[] }
  | { kind: "empty"; fromHour: number; toHour: number };

function hourOf(time: string): number {
  return Number(time.split(":")[0]);
}

function hourLabel(hour: number): string {
  return formatTime(`${String(hour).padStart(2, "0")}:00`);
}

function buildSections(slots: SlotView[]): TimelineSection[] {
  if (slots.length === 0) {
    return [];
  }
  const hours = slots.map((slot) => hourOf(slot.ref.time));
  const first = Math.min(...hours);
  const last = Math.max(...hours);

  const sections: TimelineSection[] = [];
  for (let hour = first; hour <= last; hour++) {
    const hourSlots = slots.filter((slot) => hourOf(slot.ref.time) === hour);
    if (hourSlots.length > 0) {
      sections.push({ kind: "hour", hour, slots: hourSlots });
      continue;
    }
    const previous = sections[sections.length - 1];
    if (previous && previous.kind === "empty") {
      previous.toHour = hour;
    } else {
      sections.push({ kind: "empty", fromHour: hour, toHour: hour });
    }
  }
  return sections;
}

function SectionHeading({ label }: { label: string }) {
  const rule = { flex: 1, borderTop: `2px solid ${PALETTE.sectionLine}` };
  return (
    <li
      role="presentation"
      style={{
        listStyle: "none",
        display: "flex",
        alignItems: "center",
        gap: 12,
        margin: "8px 0 12px",
      }}
    >
      <div aria-hidden="true" style={{ ...rule, flex: "0 0 16px" }} />
      <h3
        style={{
          margin: 0,
          fontSize: 16,
          fontWeight: 700,
          color: PALETTE.sectionLabel,
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </h3>
      <div aria-hidden="true" style={rule} />
    </li>
  );
}

export default function Timeline({
  slots,
  today,
  focusedKey,
  onEdit,
  onAdd,
  onRecord,
  onUndo,
}: TimelineProps) {
  if (slots.length === 0) {
    return <EmptySchedule onAdd={onAdd} />;
  }

  return (
    <ul aria-label="Doses for the day" style={{ margin: 0, padding: "16px 16px 0" }}>
      {buildSections(slots).map((section) => {
        if (section.kind === "empty") {
          const label =
            section.fromHour === section.toHour
              ? hourLabel(section.fromHour)
              : `${hourLabel(section.fromHour)} – ${hourLabel(section.toHour)}`;
          return (
            <li
              key={`empty-${section.fromHour}`}
              role="presentation"
              style={{ listStyle: "none", paddingBottom: SECTION_PADDING_BOTTOM_PX }}
            >
              <ul style={{ margin: 0, padding: 0 }}>
                <SectionHeading label={label} />
              </ul>
            </li>
          );
        }
        return (
          <li
            key={`hour-${section.hour}`}
            role="presentation"
            style={{ listStyle: "none", paddingBottom: SECTION_PADDING_BOTTOM_PX }}
          >
            <ul style={{ margin: 0, padding: 0 }}>
              <SectionHeading label={hourLabel(section.hour)} />
              {section.slots.map((slot) => (
                <SlotCard
                  key={slot.key}
                  slot={slot}
                  today={today}
                  focused={slot.key === focusedKey}
                  onRecord={onRecord}
                  onUndo={onUndo}
                  onEdit={onEdit}
                />
              ))}
            </ul>
          </li>
        );
      })}
    </ul>
  );
}
