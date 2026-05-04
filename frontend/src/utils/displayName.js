export function getShortName(user, fallback = "candidate") {
  const rawName = user?.name || user?.email || "";
  const beforeAt = rawName.split("@")[0];
  const firstPart = beforeAt.split(" ")[0].trim();
  return firstPart || fallback;
}
