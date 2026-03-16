export function Skel({ w = "100%", h = 14 }: { w?: string | number; h?: number }) {
  return (
    <div
      style={{
        width: w,
        height: h,
        background: "rgba(255,255,255,0.07)",
        borderRadius: 4,
      }}
    />
  );
}
