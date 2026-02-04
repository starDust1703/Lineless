"use client";

import { Html5Qrcode } from "html5-qrcode";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

export default function QRScan() {
  const qrRef = useRef(null);
  const runningRef = useRef(true);
  const router = useRouter();

  useEffect(() => {
    let isActive = true;
    let startPromise = null;
    runningRef.current = true;

    const qr = new Html5Qrcode("reader");
    qrRef.current = qr;

    const safeStopAndClear = async (instance) => {
      if (!instance) return;
      try {
        const state = instance.getState?.();
        if (state === 2 || state === 3 || instance.isScanning) {
          await instance.stop();
        }
      } catch { }
      try {
        await instance.clear();
      } catch { }
    };

    const startScanner = async () => {
      try {
        startPromise = qr.start(
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

            await safeStopAndClear(qrRef.current);
            qrRef.current = null;

            setTimeout(() => {
              router.push(
                `/dashboard?tab=join&q=${encodeURIComponent(decodedText)}`
              );
            }, 100);
          },
          () => { }
        );
        await startPromise;
      } catch (err) {
        if (err?.name === "AbortError") return;
        if (isActive) {
          console.error("QR scanner failed to start", err);
        }
      }
    };

    startScanner();

    return () => {
      isActive = false;
      runningRef.current = false;
      const current = qrRef.current;
      qrRef.current = null;
      if (startPromise) {
        startPromise
          .catch(() => { })
          .finally(() => {
            void safeStopAndClear(current);
          });
      } else {
        void safeStopAndClear(current);
      }
    };
  }, [router]);

  return (
    <div className="fixed inset-0 bg-black flex justify-center">
      <div id="reader" className="w-screen h-screen" />
    </div>
  );
}
