const DAY = 24 * 60 * 60 * 1000;

const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

/**
 * Group chats (already sorted newest first) into
 * Today / Yesterday / Previous 7 Days / Previous 30 Days / Older.
 */
export function groupChats(chats, now = new Date()) {
  const today = startOfDay(now);
  const groups = [
    { label: "Today", test: (t) => t >= today },
    { label: "Yesterday", test: (t) => t >= today - DAY },
    { label: "Previous 7 Days", test: (t) => t >= today - 7 * DAY },
    { label: "Previous 30 Days", test: (t) => t >= today - 30 * DAY },
    { label: "Older", test: () => true },
  ].map((group) => ({ ...group, chats: [] }));

  for (const chat of chats) {
    const time = new Date(chat.lastUpdated || 0).getTime();
    groups.find((group) => group.test(time)).chats.push(chat);
  }

  return groups.filter((group) => group.chats.length > 0);
}

export const sortChats = (chats) =>
  [...chats].sort(
    (a, b) =>
      new Date(b.lastUpdated || 0).getTime() -
      new Date(a.lastUpdated || 0).getTime(),
  );
