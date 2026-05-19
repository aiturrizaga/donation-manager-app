export function getInitials(name?: string, includeLastInitial: boolean = false): string {
  if (!name || name.trim() === '') {
    return '';
  }

  const words = name.trim().split(/\s+/);
  const firstInitial = words[0].charAt(0).toUpperCase();

  if (includeLastInitial && words.length > 1) {
    const lastInitial = words[words.length - 1].charAt(0).toUpperCase();
    return firstInitial + lastInitial;
  }

  return firstInitial;
}
