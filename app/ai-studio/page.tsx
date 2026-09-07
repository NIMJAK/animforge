"use client";

import { useRef, useState } from "react";

const MODEL_ID =
  "SmolLM2-360M-Instruct-q4f32_1-MLC";

export default function AIStudioPage() {
  const engineRef = useRef<any>(null);

  const [status, setStatus] =
    useState("Ready");

  const [progress, setProgress] =
    useState(0);

  const [result, setResult] =
    useState("");

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  async function testAI() {
    if (loading) return;

    setLoading(true);
    setError("");
    setResult("");
    setProgress(0);

    try {
      setStatus(
        "Checking secure connection..."
      );

      if (!window.isSecureContext) {
        throw new Error(
          "Secure context unavailable. Open this page using http://127.0.0.1:3000/ai-studio"
        );
      }

      setStatus(
        "Checking WebGPU..."
      );

      if (!("gpu" in navigator)) {
        throw new Error(
          "WebGPU is not available in this browser."
        );
      }

      const gpu =
        (navigator as any).gpu;

      setStatus(
        "Checking GPU adapter..."
      );

      const adapter =
        await gpu.requestAdapter();

      if (!adapter) {
        throw new Error(
          "WebGPU exists, but no GPU adapter could be created."
        );
      }

      setStatus(
        "Loading WebLLM..."
      );

      const webllm =
        await import(
          "@mlc-ai/web-llm"
        );

      const found =
        webllm.prebuiltAppConfig.model_list.some(
          (model: any) =>
            model.model_id === MODEL_ID
        );

      if (!found) {
        throw new Error(
          `Model not found: ${MODEL_ID}`
        );
      }

      let engine =
        engineRef.current;

      if (!engine) {
        setStatus(
          "Downloading AI model..."
        );

        engine =
          await webllm.CreateMLCEngine(
            MODEL_ID,
            {
              initProgressCallback:
                (report: any) => {
                  const percent =
                    Math.round(
                      (report.progress || 0) *
                        100
                    );

                  setProgress(
                    Math.max(
                      0,
                      Math.min(
                        100,
                        percent
                      )
                    )
                  );

                  setStatus(
                    report.text ||
                      `Loading model ${percent}%`
                  );
                },

              logLevel: "INFO",
            }
          );

        engineRef.current =
          engine;
      }

      setProgress(100);

      setStatus(
        "Generating test..."
      );

      const response =
        await engine.chat.completions.create(
          {
            messages: [
              {
                role: "user",
                content:
                  "Write exactly two short sentences about a boy who finds a friendly robot.",
              },
            ],

            temperature: 0.7,
            max_tokens: 80,
          }
        );

      const text =
        response.choices?.[0]
          ?.message?.content;

      if (!text) {
        throw new Error(
          "The AI loaded successfully but returned no text."
        );
      }

      setResult(text);

      setStatus(
        "AI WORKING ✓"
      );
    } catch (err) {
      console.error(
        "ANIMFORGE AI TEST ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : String(err)
      );

      setStatus(
        "TEST FAILED"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#060608] px-6 py-16 text-white">

      <div className="mx-auto max-w-2xl">

        <a
          href="/dashboard"
          className="text-sm text-zinc-500"
        >
          ← Dashboard
        </a>

        <div className="mt-8 rounded-[32px] border border-white/10 bg-white/[0.04] p-8">

          <p className="text-sm font-semibold text-violet-400">
            ANIMFORGE AI
          </p>

          <h1 className="mt-3 text-4xl font-black">
            AI Engine Test
          </h1>

          <p className="mt-4 leading-7 text-zinc-400">
            This test checks WebGPU,
            loads the local AI model and
            generates a small response.
          </p>

          <div className="mt-8 rounded-2xl border border-white/10 bg-black/30 p-5">

            <p className="text-xs uppercase tracking-wider text-zinc-600">
              Status
            </p>

            <p className="mt-2 font-semibold text-violet-300">
              {status}
            </p>

            {progress > 0 && (
              <>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">

                  <div
                    className="h-full bg-violet-500 transition-all"
                    style={{
                      width:
                        `${progress}%`,
                    }}
                  />

                </div>

                <p className="mt-2 text-xs text-zinc-500">
                  {progress}%
                </p>
              </>
            )}

          </div>

          {error && (
            <div className="mt-5 rounded-2xl border border-red-500/30 bg-red-500/10 p-5">

              <p className="font-bold text-red-300">
                ERROR
              </p>

              <p className="mt-2 break-words text-sm leading-6 text-red-200">
                {error}
              </p>

            </div>
          )}

          {result && (
            <div className="mt-5 rounded-2xl border border-green-500/30 bg-green-500/10 p-5">

              <p className="font-bold text-green-300">
                GENERATED RESULT
              </p>

              <p className="mt-3 leading-7 text-zinc-200">
                {result}
              </p>

            </div>
          )}

          <button
            type="button"
            onClick={testAI}
            disabled={loading}
            className="mt-7 w-full cursor-pointer rounded-2xl bg-white px-6 py-4 font-bold text-black disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "TESTING AI..."
              : "TEST ANIMFORGE AI"}
          </button>

          <div className="mt-8 space-y-2 text-xs text-zinc-600">

            <p>
              Model: {MODEL_ID}
            </p>

            <p>
              First test may download
              hundreds of MB.
            </p>

          </div>

        </div>

      </div>

    </main>
  );
}
