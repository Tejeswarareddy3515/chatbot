export function AnimatedBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-amber-500/25 blur-3xl animate-blob" />
      <div className="absolute right-1/4 top-20 h-96 w-96 rounded-full bg-orange-500/25 blur-3xl animate-blob [animation-delay:2s]" />
      <div className="absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-yellow-600/15 blur-3xl animate-blob [animation-delay:4s]" />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
    </div>
  );
}
