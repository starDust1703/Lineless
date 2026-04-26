"use client";

import { Html5Qrcode } from "html5-qrcode";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function QRScan() {
  const qrRef = useRef(null);
  const runningRef = useRef(true);
  const router = useRouter();
  const [error, setError] = useState(null);

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
          setError("Camera permission denied or camera not available. Please enable permissions in your browser settings.");
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
    <div className="fixed inset-0 bg-black flex justify-center items-center">
      {error ? (
        <div className="relative z-10 p-6 bg-zinc-900/90 border border-zinc-800 rounded-xl text-center max-w-sm mx-4 shadow-2xl">
          <p className="text-zinc-200 mb-6">{error}</p>
          <button 
            onClick={() => router.back()} 
            className="px-5 py-2.5 bg-white text-black font-medium rounded-lg hover:bg-zinc-200 transition active:scale-95"
          >
            Go Back
          </button>
        </div>
      ) : (
        <div id="reader" className="w-screen h-screen absolute inset-0" />
      )}
    </div>
  );
}
