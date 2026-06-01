export default function RapportPDFLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: "white", minHeight: "100vh" }}>
      {children}
    </div>
  );
}
