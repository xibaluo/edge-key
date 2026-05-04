export function parseCardLines(lines: string) {
  return Array.from(
    new Set(
      lines
        .split(/\r?\n/)
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  );
}
