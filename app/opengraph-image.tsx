import { ImageResponse } from "next/og";

export const alt = "TRAPEAK — Your data. Any AI. People you trust.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(<div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#f7f7f4", color: "#111", padding: "64px 72px", fontFamily: "Arial, sans-serif" }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}><strong style={{ fontSize: 34, letterSpacing: "-1.5px" }}>TRAPEAK</strong><span style={{ fontSize: 16, color: "#666" }}>FITNESS · NUTRITION · HEALTH</span></div>
    <div style={{ display: "flex", flexDirection: "column" }}><span style={{ fontSize: 86, lineHeight: .95, letterSpacing: "-5px", fontWeight: 650 }}>Your data.<br />Any AI.<br />People you trust.</span><span style={{ marginTop: 36, fontSize: 23, color: "#666" }}>Permissioned fitness and health context.</span></div>
    <div style={{ height: 12, width: "100%", background: "linear-gradient(90deg, #d7ff45, #a86df2)" }} />
  </div>, size);
}
