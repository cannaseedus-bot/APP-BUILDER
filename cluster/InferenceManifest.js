// InferenceManifest.js
export async function loadInferenceManifest(url = "inference_manifest.json") {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to load inference_manifest");
  return await res.json();
}
