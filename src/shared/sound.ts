import { Howl } from "howler";

export type SoundName = "taken" | "missed" | "undo" | "save" | "step" | "tab";

const SOURCES: Record<SoundName, string> = {
  taken: "/public/sounds/wav_from_original/confirmation_002.wav",
  missed: "/public/sounds/wav_from_original/click5.wav",
  // cycle:invert
  undo: "/public/sounds/wav_from_original/drop_003.wav",
  // cycle:invert
  step: "/public/sounds/wav_from_original/confirmation_001.wav",
  // cycle:invert
  save: "/public/sounds/wav_from_original/confirmation_003.wav",
  tab: "/public/sounds/wav_from_original/confirmation_001.wav",
};

const VOLUME: Record<SoundName, number> = {
  taken: 0.8,
  missed: 0.8,
  undo: 0.7,
  save: 0.8,
  step: 0.8,
  tab: 0.8,
};

const EXTRA_SOUNDS: readonly SoundName[] = ["step", "tab"];

let soundsEnabled = true;
let extraSoundsEnabled = false;
const players = new Map<SoundName, Howl>();

export function setSoundsEnabled(value: boolean): void {
  soundsEnabled = value;
}

export function setExtraSoundsEnabled(value: boolean): void {
  extraSoundsEnabled = value;
}

function playerFor(name: SoundName): Howl {
  let player = players.get(name);
  if (!player) {
    player = new Howl({ src: [SOURCES[name]], volume: VOLUME[name], preload: true });
    players.set(name, player);
  }
  return player;
}

export function playSound(name: SoundName): void {
  if (!soundsEnabled) {
    return;
  }
  if (EXTRA_SOUNDS.includes(name) && !extraSoundsEnabled) {
    return;
  }
  playerFor(name).play();
}
