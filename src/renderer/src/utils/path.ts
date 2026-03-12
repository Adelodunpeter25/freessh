export const getParentPath = (path: string, isRemote: boolean): string => {
  if (isRemote) {
    if (!path || path === "/") return "/";
    const trimmed = path.replace(/\/+$/, "");
    const idx = trimmed.lastIndexOf("/");
    return idx <= 0 ? "/" : trimmed.slice(0, idx);
  }

  if (!path) return "/";
  const hasBackslash = path.includes("\\");
  const sep = hasBackslash ? "\\" : "/";
  let trimmed = path;
  if (trimmed.length > 1 && trimmed.endsWith(sep)) {
    trimmed = trimmed.slice(0, -1);
  }

  if (hasBackslash) {
    if (/^[A-Za-z]:\\?$/.test(trimmed)) {
      return `${trimmed.slice(0, 2)}\\`;
    }
  } else if (trimmed === "/") {
    return "/";
  }

  const idx = trimmed.lastIndexOf(sep);
  if (idx < 0) return trimmed;
  if (hasBackslash && idx === 2) {
    return `${trimmed.slice(0, 2)}\\`;
  }
  return idx === 0 ? sep : trimmed.slice(0, idx);
};
