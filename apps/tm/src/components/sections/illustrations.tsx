/**
 * Animated SVG mini-illustrations for ProblemMirror & Services cards.
 * All use SMIL animations — no JS runtime overhead, no extra deps.
 * Designed at viewBox 120x80; scale freely.
 */

const STROKE = "rgba(137,170,204,0.45)";
const STROKE_FAINT = "rgba(255,255,255,0.12)";
const ACCENT = "#89aacc";

/* ========== ProblemMirror ========== */

export const ExcelChaosIllo = () => (
  <svg viewBox="0 0 120 80" className="h-full w-full" aria-hidden>
    {Array.from({ length: 16 }).map((_, i) => {
      const col = i % 4;
      const row = Math.floor(i / 4);
      const x = col * 27 + 6;
      const y = row * 16 + 8;
      const delay = ((i * 0.41) % 4).toFixed(2);
      return (
        <rect
          key={i}
          x={x}
          y={y}
          width="23"
          height="12"
          rx="1.5"
          fill="rgba(255,255,255,0.03)"
          stroke={STROKE_FAINT}
          strokeWidth="0.6"
        >
          <animate
            attributeName="fill"
            values="rgba(255,255,255,0.03);rgba(137,170,204,0.55);rgba(255,255,255,0.03)"
            dur="3.2s"
            begin={`${delay}s`}
            repeatCount="indefinite"
          />
        </rect>
      );
    })}
    {/* Crack line cutting through */}
    <path
      d="M 0 38 L 28 36 L 32 44 L 60 40 L 64 50 L 92 42 L 96 50 L 120 46"
      stroke="rgba(255, 90, 90, 0.4)"
      strokeWidth="0.7"
      fill="none"
      strokeDasharray="3 2"
    >
      <animate
        attributeName="stroke-dashoffset"
        values="0;10"
        dur="2s"
        repeatCount="indefinite"
      />
    </path>
  </svg>
);

export const DoubleEntryIllo = () => (
  <svg viewBox="0 0 120 80" className="h-full w-full" aria-hidden>
    {[6, 44, 82].map((x, i) => (
      <g key={i}>
        <rect
          x={x}
          y="14"
          width="32"
          height="52"
          rx="2"
          fill="rgba(255,255,255,0.02)"
          stroke={STROKE_FAINT}
          strokeWidth="0.7"
        />
        <line
          x1={x + 4}
          y1="22"
          x2={x + 22}
          y2="22"
          stroke="rgba(255,255,255,0.25)"
          strokeWidth="0.8"
        />
        <line
          x1={x + 4}
          y1="28"
          x2={x + 26}
          y2="28"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="0.8"
        />
        <line
          x1={x + 4}
          y1="34"
          x2={x + 18}
          y2="34"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="0.8"
        />
        <line
          x1={x + 4}
          y1="40"
          x2={x + 24}
          y2="40"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="0.8"
        />
        <line
          x1={x + 4}
          y1="46"
          x2={x + 20}
          y2="46"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="0.8"
        />
      </g>
    ))}
    {/* Connector arrows */}
    <line x1="38" y1="40" x2="44" y2="40" stroke={STROKE} strokeWidth="0.8" strokeDasharray="1.5 1.5" />
    <line x1="76" y1="40" x2="82" y2="40" stroke={STROKE} strokeWidth="0.8" strokeDasharray="1.5 1.5" />
    {/* Copying dot */}
    <circle r="3" fill={ACCENT}>
      <animateMotion
        dur="3.4s"
        repeatCount="indefinite"
        path="M 22 40 L 60 40 L 98 40 L 22 40"
      />
      <animate
        attributeName="opacity"
        values="0;1;1;0;1;1;0"
        dur="3.4s"
        repeatCount="indefinite"
      />
    </circle>
  </svg>
);

export const KnowledgeSiloIllo = () => (
  <svg viewBox="0 0 120 80" className="h-full w-full" aria-hidden>
    {/* Disconnected outer nodes */}
    {[
      [16, 18],
      [104, 18],
      [16, 62],
      [104, 62],
    ].map(([x, y], i) => (
      <g key={i} opacity="0.35">
        <line
          x1="60"
          y1="40"
          x2={x}
          y2={y}
          stroke="rgba(255,255,255,0.25)"
          strokeWidth="0.6"
          strokeDasharray="2 3"
        />
        <circle
          cx={x}
          cy={y}
          r="3"
          fill="none"
          stroke="rgba(255,255,255,0.35)"
          strokeWidth="0.7"
        />
      </g>
    ))}
    {/* Central solo node */}
    <circle cx="60" cy="40" r="14" fill="none" stroke={STROKE} strokeWidth="0.6">
      <animate attributeName="r" values="8;18;8" dur="3.2s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="0.6;0;0.6" dur="3.2s" repeatCount="indefinite" />
    </circle>
    <circle cx="60" cy="40" r="6" fill={ACCENT}>
      <animate attributeName="opacity" values="0.7;1;0.7" dur="2s" repeatCount="indefinite" />
    </circle>
    {/* Lock icon hint inside node */}
    <rect
      x="58"
      y="39"
      width="4"
      height="3"
      rx="0.5"
      fill="rgba(0,0,0,0.4)"
    />
  </svg>
);

export const AIFizzleIllo = () => (
  <svg viewBox="0 0 120 80" className="h-full w-full" aria-hidden>
    {/* Sparkles flickering */}
    {[
      [30, 22, 0],
      [55, 16, 0.6],
      [80, 24, 1.2],
      [45, 32, 1.8],
      [70, 36, 0.3],
    ].map(([x, y, delay], i) => (
      <g key={i} transform={`translate(${x} ${y})`}>
        <path
          d="M 0 -5 L 1.2 -1.2 L 5 0 L 1.2 1.2 L 0 5 L -1.2 1.2 L -5 0 L -1.2 -1.2 Z"
          fill="rgba(255,255,255,0.55)"
        >
          <animate
            attributeName="opacity"
            values="0;1;0"
            dur="2.4s"
            begin={`${delay}s`}
            repeatCount="indefinite"
          />
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="0;180"
            dur="4s"
            begin={`${delay}s`}
            repeatCount="indefinite"
          />
        </path>
      </g>
    ))}
    {/* Progress bar that fills then resets (fails) */}
    <rect
      x="20"
      y="58"
      width="80"
      height="3"
      rx="1.5"
      fill="rgba(255,255,255,0.06)"
    />
    <rect x="20" y="58" height="3" rx="1.5" fill={ACCENT}>
      <animate
        attributeName="width"
        values="0;55;55;0"
        keyTimes="0;0.55;0.7;1"
        dur="3.5s"
        repeatCount="indefinite"
      />
      <animate
        attributeName="opacity"
        values="1;1;0.3;0"
        keyTimes="0;0.55;0.7;1"
        dur="3.5s"
        repeatCount="indefinite"
      />
    </rect>
    {/* Error/X marker at progress end */}
    <g transform="translate(75 58)">
      <line x1="-2" y1="-2" x2="2" y2="2" stroke="rgba(255, 90, 90, 0.7)" strokeWidth="1">
        <animate attributeName="opacity" values="0;0;1;0" keyTimes="0;0.6;0.7;1" dur="3.5s" repeatCount="indefinite" />
      </line>
      <line x1="2" y1="-2" x2="-2" y2="2" stroke="rgba(255, 90, 90, 0.7)" strokeWidth="1">
        <animate attributeName="opacity" values="0;0;1;0" keyTimes="0;0.6;0.7;1" dur="3.5s" repeatCount="indefinite" />
      </line>
    </g>
  </svg>
);

/* ========== Services ========== */

export const WorkflowIllo = () => {
  const nodes: Array<[number, number, string]> = [
    [16, 20, "Input"],
    [60, 20, "Validate"],
    [60, 60, "Transform"],
    [104, 60, "Output"],
  ];
  return (
    <svg viewBox="0 0 120 80" className="h-full w-full" aria-hidden>
      {/* Connection paths */}
      <path
        d="M 22 20 L 54 20 M 60 26 L 60 54 M 66 60 L 98 60"
        stroke={STROKE}
        strokeWidth="0.8"
        fill="none"
        strokeDasharray="2 1.5"
      />
      {/* Nodes */}
      {nodes.map(([x, y], i) => (
        <g key={i}>
          <rect
            x={x - 6}
            y={y - 4}
            width="12"
            height="8"
            rx="1.5"
            fill="rgba(255,255,255,0.04)"
            stroke={STROKE}
            strokeWidth="0.7"
          />
          <circle cx={x} cy={y} r="1.2" fill={ACCENT}>
            <animate
              attributeName="opacity"
              values="0.4;1;0.4"
              dur="2s"
              begin={`${i * 0.5}s`}
              repeatCount="indefinite"
            />
          </circle>
        </g>
      ))}
      {/* Traveling dot */}
      <circle r="2.4" fill={ACCENT}>
        <animateMotion
          dur="3.8s"
          repeatCount="indefinite"
          path="M 16 20 L 60 20 L 60 60 L 104 60"
        />
      </circle>
    </svg>
  );
};

export const AIBrainIllo = () => {
  const l1 = [18, 40, 62];
  const l2 = [14, 30, 50, 66];
  const l3 = [32, 48];
  return (
    <svg viewBox="0 0 120 80" className="h-full w-full" aria-hidden>
      {/* Connections L1 -> L2 */}
      {l1.flatMap((y1) =>
        l2.map((y2) => (
          <line
            key={`a${y1}-${y2}`}
            x1="18"
            y1={y1}
            x2="60"
            y2={y2}
            stroke="rgba(137,170,204,0.15)"
            strokeWidth="0.5"
          />
        ))
      )}
      {/* Connections L2 -> L3 */}
      {l2.flatMap((y1) =>
        l3.map((y2) => (
          <line
            key={`b${y1}-${y2}`}
            x1="60"
            y1={y1}
            x2="102"
            y2={y2}
            stroke="rgba(137,170,204,0.15)"
            strokeWidth="0.5"
          />
        ))
      )}
      {/* Pulses traveling */}
      {[0, 0.7, 1.4, 2.1].map((delay, i) => (
        <circle key={i} r="1.6" fill={ACCENT}>
          <animateMotion
            dur="2.6s"
            begin={`${delay}s`}
            repeatCount="indefinite"
            path={`M 18 ${l1[i % 3]} L 60 ${l2[i % 4]} L 102 ${l3[i % 2]}`}
          />
          <animate
            attributeName="opacity"
            values="0;1;1;0"
            dur="2.6s"
            begin={`${delay}s`}
            repeatCount="indefinite"
          />
        </circle>
      ))}
      {/* Layer nodes */}
      {l1.map((y) => (
        <circle key={`l1-${y}`} cx="18" cy={y} r="2.5" fill="rgba(137,170,204,0.3)" stroke={ACCENT} strokeWidth="0.8" />
      ))}
      {l2.map((y) => (
        <circle key={`l2-${y}`} cx="60" cy={y} r="2.5" fill="rgba(137,170,204,0.3)" stroke={ACCENT} strokeWidth="0.8" />
      ))}
      {l3.map((y) => (
        <circle key={`l3-${y}`} cx="102" cy={y} r="3" fill={ACCENT}>
          <animate attributeName="opacity" values="0.6;1;0.6" dur="1.8s" repeatCount="indefinite" />
        </circle>
      ))}
    </svg>
  );
};

export const CustomSoftwareIllo = () => {
  const blocks = [
    { x: 18, y: 18, w: 56, dur: 4.6 },
    { x: 30, y: 30, w: 48, dur: 5.2 },
    { x: 14, y: 42, w: 68, dur: 4.2 },
    { x: 26, y: 54, w: 52, dur: 4.8 },
  ];
  return (
    <svg viewBox="0 0 120 80" className="h-full w-full" aria-hidden>
      {blocks.map((b, i) => (
        <g key={i}>
          <rect
            x={b.x}
            y={b.y}
            width={b.w}
            height="6"
            rx="1"
            fill="rgba(255,255,255,0.04)"
            stroke="rgba(137,170,204,0.25)"
            strokeWidth="0.6"
          >
            <animate
              attributeName="x"
              values={`${b.x};${b.x + 6};${b.x}`}
              dur={`${b.dur}s`}
              repeatCount="indefinite"
            />
          </rect>
          <circle cx={b.x + 3} cy={b.y + 3} r="0.9" fill={ACCENT}>
            <animate
              attributeName="x"
              values={`${b.x + 3};${b.x + 9};${b.x + 3}`}
              dur={`${b.dur}s`}
              repeatCount="indefinite"
            />
          </circle>
          {/* fake code dashes inside */}
          <line
            x1={b.x + 7}
            y1={b.y + 3}
            x2={b.x + b.w - 4}
            y2={b.y + 3}
            stroke="rgba(255,255,255,0.18)"
            strokeWidth="0.5"
            strokeDasharray="2 1.5"
          />
        </g>
      ))}
    </svg>
  );
};

export const WebIllo = () => (
  <svg viewBox="0 0 120 80" className="h-full w-full" aria-hidden>
    {/* Browser frame */}
    <rect
      x="10"
      y="12"
      width="100"
      height="56"
      rx="2.5"
      fill="rgba(255,255,255,0.02)"
      stroke={STROKE_FAINT}
      strokeWidth="0.8"
    />
    {/* Top bar dots */}
    <circle cx="15" cy="18" r="1.1" fill="rgba(255,255,255,0.3)" />
    <circle cx="19" cy="18" r="1.1" fill="rgba(255,255,255,0.3)" />
    <circle cx="23" cy="18" r="1.1" fill="rgba(255,255,255,0.3)" />
    <rect x="32" y="16" width="50" height="4" rx="1" fill="rgba(255,255,255,0.04)" />
    <line x1="10" y1="24" x2="110" y2="24" stroke="rgba(255,255,255,0.08)" strokeWidth="0.6" />
    {/* Content blocks growing */}
    {[
      { y: 30, max: 70, delay: 0 },
      { y: 40, max: 55, delay: 0.4 },
      { y: 50, max: 65, delay: 0.8 },
    ].map((b, i) => (
      <rect key={i} x="18" y={b.y} height="4" rx="1" fill="rgba(137,170,204,0.4)">
        <animate
          attributeName="width"
          values={`0;${b.max};${b.max};0`}
          keyTimes="0;0.4;0.85;1"
          dur="4s"
          begin={`${b.delay}s`}
          repeatCount="indefinite"
        />
      </rect>
    ))}
    {/* CTA button */}
    <rect x="18" y="58" width="22" height="5" rx="2.5" fill={ACCENT}>
      <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
    </rect>
  </svg>
);
