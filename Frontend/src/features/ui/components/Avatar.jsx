import { useState } from "react";

const initials = (name = "") =>
  name
    .replace(/[_\-.]+/g, " ")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "U";

const Avatar = ({ user, size = 32, className = "" }) => {
  const [failed, setFailed] = useState(false);
  const style = { width: size, height: size, fontSize: size * 0.4 };

  if (user?.avatar && !failed) {
    return (
      <img
        src={user.avatar}
        alt=""
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className={`shrink-0 rounded-full object-cover ${className}`}
        style={style}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center rounded-full bg-accent-soft font-semibold text-accent ${className}`}
      style={style}
    >
      {initials(user?.username)}
    </span>
  );
};

export default Avatar;
