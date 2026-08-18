export const dynamic = 'force-dynamic';

import { Suspense } from "react";
import FacebookCallbackClient from "./FacebookCallbackClient";

export default function FacebookCallbackPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100svh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
          <p style={{ fontSize: 14, color: "#475569" }}>Memproses otorisasi Facebook...</p>
        </div>
      </div>
    }>
      <FacebookCallbackClient />
    </Suspense>
  );
}
