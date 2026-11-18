/*
  Time-of-day welcome lines. "{name}" is replaced with the user's name.
  One is picked at random each time the home screen opens, never repeating
  the line shown last time.
*/
const POOLS = {
  morning: [
    "Good morning, {name}",
    "Rise and shine, {name}",
    "Morning, {name}. Coffee's ready?",
    "Fresh start, {name}",
    "Let's make today count, {name}",
  ],
  afternoon: [
    "Good afternoon, {name}",
    "Afternoon, {name}",
    "Hope your day's going well, {name}",
    "Back at it, {name}?",
    "Let's keep the momentum, {name}",
  ],
  evening: [
    "Good evening, {name}",
    "Evening, {name}",
    "Winding down, {name}?",
    "How was your day, {name}?",
    "Evening session, {name}?",
  ],
  night: [
    "Burning the midnight oil, {name}?",
    "Hello, night owl",
    "Late-night thoughts, {name}?",
    "Still up, {name}?",
    "Quiet hours, {name}",
  ],
};

export const partOfDay = (hour = new Date().getHours()) =>
  hour >= 5 && hour < 12
    ? "morning"
    : hour >= 12 && hour < 17
      ? "afternoon"
      : hour >= 17 && hour < 21
        ? "evening"
        : "night";

const LAST_KEY = "hermes-last-greeting";

export function pickGreeting(name) {
  const pool = POOLS[partOfDay()];
  let last = null;
  try {
    last = sessionStorage.getItem(LAST_KEY);
  } catch {
    /* storage unavailable */
  }
  const options = pool.filter((line) => line !== last);
  const line = options[Math.floor(Math.random() * options.length)];
  try {
    sessionStorage.setItem(LAST_KEY, line);
  } catch {
    /* ignore */
  }
  return name
    ? line.replace("{name}", name)
    : line.replace(/,? ?\{name\}/, "").replace(/\s+([?.])/, "$1");
}
