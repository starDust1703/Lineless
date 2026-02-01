"use client";

import { Html5Qrcode } from "html5-qrcode";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

export default function QRScan() {
  const qrRef = useRef(null);
  const runningRef = useRef(true);
  const router = useRouter();

  useEffect(() => {
    const qr = new Html5Qrcode("reader");
    qrRef.current = qr;

    qr.start(
      { facingMode: "environment" },
      {
        fps: 15,
        qrbox: { width: 600, height: 800 },
        disableFlip: true,
      },
      async (decodedText) => {
        if (!runningRef.current) return;
        runningRef.current = false;

        navigator.vibrate?.(100);

        try {
          await qrRef.current?.stop();
          await qrRef.current?.clear();
          qrRef.current = null;
        } catch {}

        setTimeout(() => {
          router.push(
            `/dashboard?tab=join&q=${encodeURIComponent(decodedText)}`
          );
        }, 100);
      },
      () => {}
    );

    return () => {
      runningRef.current = false;
    };
  }, [router]);

  return (
    <div className="fixed inset-0 bg-black">
      <div id="reader" className="w-full h-full" />
    </div>
  );
}
