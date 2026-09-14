/**
 * The Detasawy mark: an isometric block with an S-seam cut into its right
 * face. Drawn as vectors so it stays sharp from a favicon to a banner.
 *
 * On a dark surface the outline switches to the ice tone, otherwise the dark
 * edges would disappear into the background.
 */
type Tone = "ink" | "light";

const FACE_TOP = "#D9EAFD";
const FACE_LEFT = "#BCCCDC";
const FACE_RIGHT = "#9AA6B2";
const EDGE_DARK = "#22303c";
const EDGE_LIGHT = "#F7FBFC";

export function Mark({
  size = 32,
  tone = "ink",
  className,
}: {
  size?: number;
  tone?: Tone;
  className?: string;
}) {
  const edge = tone === "light" ? EDGE_LIGHT : EDGE_DARK;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 96 96"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path d="M48 12 L81 31 L48 50 L15 31 Z" fill={FACE_TOP} />
      <path d="M15 31 L15 69 L48 88 L48 50 Z" fill={FACE_LEFT} />
      <path d="M81 31 L81 69 L48 88 L48 50 Z" fill={FACE_RIGHT} />
      <path
        d="M72 42 L58 50 L58 58 L72 50 L72 58 L58 66"
        stroke={EDGE_LIGHT}
        strokeWidth="5"
        strokeLinejoin="miter"
        strokeLinecap="round"
      />
      <path
        d="M48 12 L81 31 L81 69 L48 88 L15 69 L15 31 Z"
        stroke={edge}
        strokeWidth="4.5"
        strokeLinejoin="round"
      />
      <path
        d="M48 50 L48 88 M48 50 L15 31 M48 50 L81 31"
        stroke={edge}
        strokeWidth="4.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Logo({
  size = 30,
  tone = "ink",
  tagline = false,
}: {
  size?: number;
  tone?: Tone;
  tagline?: boolean;
}) {
  return (
    <span className="flex items-center gap-2.5">
      <Mark size={size} tone={tone} />
      <span className="leading-none">
        <span
          className={`block text-[17px] font-extrabold tracking-tight ${
            tone === "light" ? "text-white" : "text-ink"
          }`}
        >
          detasawy
        </span>
        {tagline && (
          <span className="mt-1 block text-[8px] font-bold uppercase tracking-[0.22em] text-azure">
            pukhto datasets
          </span>
        )}
      </span>
    </span>
  );
}
