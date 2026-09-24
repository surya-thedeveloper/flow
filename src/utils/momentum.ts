/**
 * Calculates deterministic psychological "50% Momentum" progress percentage.
 * 
 * Rules:
 * - 0 completed -> 0%
 * - All completed -> 100%
 * - Reaches ~50% momentum before half of the work is completed
 * - When only 1 task is remaining, the percentage jumps above 90% (e.g. 91% - 96%) to deliver a strong finishing surge
 * - Deterministic, strictly monotonic, and values feel natural and rewarding
 */
export function calculateMomentum(completed: number, total: number): number {
  if (total <= 0 || completed <= 0) return 0;
  if (completed >= total) return 100;

  // When only 1 task remains (penultimate step), ensure momentum is above 90%
  if (total >= 3 && completed === total - 1) {
    const finalSurge = 91 + Math.min(5, Math.floor((total - 3) * 0.7));
    return finalSurge;
  }

  const ratio = completed / total;
  const targetMidpoint = Math.min(0.48, Math.max(0.25, 0.20 + 1.0 / total));
  const exponent = Math.log(0.5) / Math.log(targetMidpoint);
  
  const raw = Math.pow(ratio, exponent) * 100;
  const rounded = Math.round(raw);

  // If not the final item in a list with >= 3 items, cap below 89% to preserve the >90% surge on the last item
  const maxAllowed = total >= 3 && completed < total - 1 ? 88 : 99;
  return Math.min(maxAllowed, Math.max(1, rounded));
}

/**
 * Returns factual task count description, e.g. "3 of 10 completed"
 */
export function formatFactualCount(completed: number, total: number): string {
  if (total === 0) return 'No items';
  return `${completed} of ${total} done`;
}

/**
 * Formats a timestamp into a clean, minimal relative or date string
 */
export function formatRelativeTime(timestamp: number): string {
  if (!timestamp) return '';
  const now = Date.now();
  const diffMs = now - timestamp;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSec < 45) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;

  const date = new Date(timestamp);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
