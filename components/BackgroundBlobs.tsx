export default function BackgroundBlobs({
  blobs = [
    { top: "-10%", right: "-5%", color: "rgba(43,92,230,0.18)", size: 500 },
    { top: "40%", left: "-8%", color: "rgba(124,58,237,0.12)", size: 400 },
    { bottom: "-10%", right: "20%", color: "rgba(29,158,117,0.10)", size: 450 },
  ],
}: {
  blobs?: {
    top?: string;
    bottom?: string;
    left?: string;
    right?: string;
    color: string;
    size: number;
  }[];
}) {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {blobs.map((b, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: b.top,
            bottom: b.bottom,
            left: b.left,
            right: b.right,
            width: b.size,
            height: b.size,
            borderRadius: "50%",
            background: b.color,
            filter: "blur(85px)",
            opacity: 1,
          }}
        />
      ))}
    </div>
  );
}
