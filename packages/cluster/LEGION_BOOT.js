// LEGION_BOOT.js
import { loadInferenceManifest } from "./InferenceManifest.js";
import { LEGION_FUSION } from "./LEGION_FUSION.js";
import { ModelTrainer } from "./ModelTrainer.js";

export async function bootLegion() {
  const manifest = await loadInferenceManifest();
  const cfg = manifest.engines;

  const legion = new LEGION_FUSION({
    cline:    cfg["cline-java"],
    janus:    cfg["janus-deepseek"],
    llama:    cfg["llama-devmicro"],
    kuhul:    cfg["llama-kuhul"],
    qwen:     cfg["qwen-asx"],
    ollama:   cfg["ollama-main"]
  });

  await legion.load();

  const trainer = new ModelTrainer({ baseUrl: "http://localhost:8081" });

  return { legion, trainer, manifest };
}
