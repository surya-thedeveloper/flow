import React, { useState, useEffect, useRef } from 'react';
import { calculateMomentum } from '../utils/momentum';

interface ProgressBarProps {
  completed: number;
  total: number;
  size?: 'compact' | 'prominent';
  showLabel?: boolean;
  lastFlowAt?: number;
}

export function formatCompletedAt(timestamp?: number): string {
  if (!timestamp) return 'All complete';
  const targetDate = new Date(timestamp);
  let hours = targetDate.getHours();
  const minutes = targetDate.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const minutesStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
  const timeStr = `${hours}.${minutesStr} ${ampm}`;
  const day = targetDate.getDate();
  const month = targetDate.getMonth() + 1;
  return `Completed at ${day}/${month} · ${timeStr}`;
}

export function formatLastFlowTime(timestamp?: number): string {
  if (!timestamp) return '';
  const targetDate = new Date(timestamp);
  const now = new Date();

  let hours = targetDate.getHours();
  const minutes = targetDate.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const minutesStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
  const timeStr = `${hours}.${minutesStr} ${ampm}`;

  const isSameDay =
    targetDate.getFullYear() === now.getFullYear() &&
    targetDate.getMonth() === now.getMonth() &&
    targetDate.getDate() === now.getDate();

  if (isSameDay) {
    return `Last flow at ${timeStr}`;
  }

  const day = targetDate.getDate();
  const month = targetDate.getMonth() + 1;
  return `Last flow at ${day}/${month} · ${timeStr}`;
}

// Smooth 60fps RAF animation hook for fluid water flow synchronization
function useSmoothProgress(target: number, duration = 850): number {
  const [current, setCurrent] = useState(target);
  const currentRef = useRef(target);
  const targetRef = useRef(target);
  const startRef = useRef(target);
  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    targetRef.current = target;
    startRef.current = currentRef.current;
    startTimeRef.current = performance.now();

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const step = (now: number) => {
      if (startTimeRef.current === null) return;
      const elapsed = now - startTimeRef.current;
      const progress = Math.min(1, elapsed / duration);
      const eased = easeOutCubic(progress);
      const nextValue = startRef.current + (targetRef.current - startRef.current) * eased;

      currentRef.current = nextValue;
      setCurrent(nextValue);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      }
    };

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [target, duration]);

  return current;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  completed,
  total,
  size = 'prominent',
  showLabel = true,
  lastFlowAt,
}) => {
  const targetPercent = calculateMomentum(completed, total);
  const animatedPercent = useSmoothProgress(targetPercent, 850);
  const isFullyCompleted = total > 0 && completed === total;

  if (size === 'compact') {
    return (
      <div className="compact-progress-wrapper">
        <div className="compact-progress-wave-box">
          <svg
            className="compact-wave-svg"
            viewBox="0 0 100 10"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="compact-wave-body-grad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#00f2fe" />
                <stop offset="65%" stopColor="#06b6d4" />
                <stop offset="88%" stopColor="#2dd4bf" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0.1" />
              </linearGradient>
            </defs>

            {/* Ambient Background Wave Line */}
            <path
              d="M 0,5 Q 12.5,2 25,5 T 50,5 T 75,5 T 100,5"
              fill="none"
              stroke="rgba(56, 189, 248, 0.18)"
              strokeWidth="2.2"
              strokeLinecap="round"
            />

            {/* Active Filled Wavy Line with Faded Ending */}
            {animatedPercent > 0 && (
              <g clipPath={`polygon(0 0, ${animatedPercent}% 0, ${animatedPercent}% 100%, 0 100%)`}>
                <path
                  d="M 0,5 Q 12.5,2 25,5 T 50,5 T 75,5 T 100,5"
                  fill="none"
                  stroke="url(#compact-wave-body-grad)"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                />
              </g>
            )}
          </svg>
        </div>
        {showLabel && (
          <span className="compact-progress-label">
            {targetPercent}%
          </span>
        )}
      </div>
    );
  }

  const w = (animatedPercent / 100) * 1200;

  // Wave trailing ending edge path - calculated with synchronized animated width
  const filledPath =
    animatedPercent <= 0
      ? 'M 0,0 Z'
      : animatedPercent >= 100
      ? 'M 0,0 L 1200,0 L 1200,80 L 0,80 Z'
      : `M 0,0 L ${w},0 C ${w + 12},18 ${w - 12},36 ${w},54 C ${w + 10},66 ${w - 6},74 ${w},80 L 0,80 Z`;

  const unfilledPath =
    animatedPercent <= 0
      ? 'M 0,0 L 1200,0 L 1200,80 L 0,80 Z'
      : animatedPercent >= 100
      ? 'M 1200,0 Z'
      : `M ${w},0 C ${w + 12},18 ${w - 12},36 ${w},54 C ${w + 10},66 ${w - 6},74 ${w},80 L 1200,80 L 1200,0 Z`;

  const wavyEdgePath = `M ${w},0 C ${w + 12},18 ${w - 12},36 ${w},54 C ${w + 10},66 ${w - 6},74 ${w},80`;

  // Full-span top wavy progress bar that blends with the dark background
  return (
    <div className="top-wave-progress-sticky">
      {/* Wave canvas container */}
      <div className="wave-canvas-wrapper">
        <svg
          className="wave-main-svg"
          viewBox="0 0 1200 80"
          preserveAspectRatio="none"
        >
          <defs>
            {/* Full Wave Shape ClipPath - ensures fill is strictly inside the wave */}
            <clipPath id="full-wave-shape">
              <path d="M 0,0 L 1200,0 L 1200,56 C 1100,72 1000,40 900,56 C 800,72 700,40 600,56 C 500,72 400,40 300,56 C 200,72 100,40 0,56 Z" />
            </clipPath>

            {/* ClipPath for Active Water Fill Region [0 to percent%] with Wavy Ending Edge */}
            <clipPath id="active-water-fill-clip">
              <path d={filledPath} />
            </clipPath>

            {/* ClipPath for Unfilled Track Region */}
            <clipPath id="unfilled-track-clip">
              <path d={unfilledPath} />
            </clipPath>

            {/* Neon Blue to Teal Horizontal Gradient with Faded Ending Line */}
            <linearGradient id="water-body-gradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#00f2fe" />
              <stop offset="35%" stopColor="#06b6d4" />
              <stop offset="70%" stopColor="#14b8a6" />
              <stop offset="92%" stopColor="#2dd4bf" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0.2" />
            </linearGradient>

            {/* Neon Blue to Teal Surface Line Highlight */}
            <linearGradient id="water-surface-stroke" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#7dd3fc" />
              <stop offset="30%" stopColor="#00f2fe" />
              <stop offset="65%" stopColor="#2dd4bf" />
              <stop offset="100%" stopColor="#5eead4" />
            </linearGradient>

            {/* Wavy Trailing End Edge Soft Faded Stroke */}
            <linearGradient id="water-edge-fade-stroke" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5eead4" stopOpacity="0.05" />
              <stop offset="25%" stopColor="#2dd4bf" stopOpacity="0.35" />
              <stop offset="50%" stopColor="#00f2fe" stopOpacity="0.45" />
              <stop offset="75%" stopColor="#2dd4bf" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#5eead4" stopOpacity="0.05" />
            </linearGradient>

            {/* Ambient Background Wave Track Gradient */}
            <linearGradient id="track-ambient-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(0, 242, 254, 0.06)" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>

            {/* Unfilled Track Line Gradient */}
            <linearGradient id="unfilled-track-line-grad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="rgba(56, 189, 248, 0.35)" />
              <stop offset="50%" stopColor="rgba(56, 189, 248, 0.22)" />
              <stop offset="100%" stopColor="rgba(37, 99, 235, 0.15)" />
            </linearGradient>

            {/* Water Shimmer Sweep Gradient */}
            <linearGradient id="water-shimmer-sweep" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="transparent" />
              <stop offset="35%" stopColor="rgba(255, 255, 255, 0.05)" />
              <stop offset="50%" stopColor="rgba(255, 255, 255, 0.5)" />
              <stop offset="65%" stopColor="rgba(255, 255, 255, 0.05)" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>

            {/* Water Glow Caustic Filter */}
            <filter id="water-glow-filter" x="-20%" y="-40%" width="140%" height="180%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* 1. Ambient Background Wave Shape across full width */}
          <path
            d="M 0,0 L 1200,0 L 1200,56 C 1100,72 1000,40 900,56 C 800,72 700,40 600,56 C 500,72 400,40 300,56 C 200,72 100,40 0,56 Z"
            fill="url(#track-ambient-grad)"
          />

          {/* 2. Unfilled Track Line ONLY in remaining section (NO OVERLAPPING with active line) */}
          <g clipPath="url(#unfilled-track-clip)">
            <path
              d="M 0,56 C 100,40 200,72 300,56 C 400,40 500,72 600,56 C 700,40 800,72 900,56 C 1000,40 1100,72 1200,56"
              fill="none"
              stroke="url(#unfilled-track-line-grad)"
              strokeWidth="2"
            />
          </g>

          {/* 3. Active Water Fill - Smooth fluid flowing water with faded wavy ending edge */}
          {animatedPercent > 0 && (
            <g clipPath="url(#full-wave-shape)">
              <path
                d={filledPath}
                fill="url(#water-body-gradient)"
                className="active-wave-fill-path"
              />
            </g>
          )}

          {/* 4. Active Glowing Water Surface Line & Faded Wavy End Edge Line */}
          {animatedPercent > 0 && (
            <g clipPath="url(#full-wave-shape)">
              <g clipPath="url(#active-water-fill-clip)">
                <path
                  d="M 0,56 C 100,40 200,72 300,56 C 400,40 500,72 600,56 C 700,40 800,72 900,56 C 1000,40 1100,72 1200,56"
                  fill="none"
                  stroke="url(#water-surface-stroke)"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  filter="url(#water-glow-filter)"
                />
              </g>
              {/* Softly Faded Wavy trailing ending line - moves in 100% sync */}
              {animatedPercent < 100 && (
                <path
                  d={wavyEdgePath}
                  fill="none"
                  stroke="url(#water-edge-fade-stroke)"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  opacity="0.65"
                  filter="url(#water-glow-filter)"
                />
              )}
            </g>
          )}

          {/* 5. Water Shimmer Light Sweep ONLY across the filled water width */}
          {animatedPercent > 0 && (
            <g clipPath="url(#full-wave-shape)">
              <g clipPath="url(#active-water-fill-clip)">
                <svg
                  x="0"
                  y="0"
                  width={w}
                  height="80"
                  viewBox="0 0 100 80"
                  preserveAspectRatio="none"
                >
                  <rect
                    x="-100"
                    y="0"
                    width="100"
                    height="80"
                    fill="url(#water-shimmer-sweep)"
                    className="water-shimmer-sweep-rect"
                  />
                </svg>
              </g>
            </g>
          )}
        </svg>
      </div>

      {/* Metrics below wave: left side (start) done number / completed at, right side (end) percent */}
      <div className="top-wave-metrics-row">
        <div className="wave-metric-left-col">
          {isFullyCompleted ? (
            <span className="wave-metric-done">
              {lastFlowAt ? formatCompletedAt(lastFlowAt) : 'All complete'}
            </span>
          ) : (
            <>
              <span className="wave-metric-done">
                {total === 0 ? '0 items' : `${completed} of ${total} done`}
              </span>
              {lastFlowAt && (
                <span className="wave-metric-last-flow">
                  {formatLastFlowTime(lastFlowAt)}
                </span>
              )}
            </>
          )}
        </div>
        <span className="wave-metric-percent">
          {targetPercent}%
        </span>
      </div>
    </div>
  );
};
