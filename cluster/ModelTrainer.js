// ModelTrainer.js
// K'UHUL CLUSTER TRAINER — wraps /api/cluster for training + RLHF

import { SCXQ2 } from "./KUHUL/scxq2.js";
import { FusionMath } from "./KUHUL/fusion-math.js";

export class ModelTrainer {
  constructor(config = {}) {
    this.baseUrl = config.baseUrl || "http://localhost:8081";
  }

  /**
   * Submit a training job to cluster-os2.
   * job = { type: "train", data: {...}, model: "llama-kuhul" }
   */
  async submitTrainingJob(job, replicateCount = 100) {
    const payload = {
      replicate: {
        count: replicateCount,
        job
      }
    };

    const res = await fetch(`${this.baseUrl}/api/cluster`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      throw new Error(`Trainer error: ${res.status} ${res.statusText}`);
    }
    return await res.json(); // { results: [...] }
  }

  /**
   * Compute aggregate metrics (avg accuracy / loss).
   */
  computeMetrics(clusterResult) {
    const acc = [];
    const loss = [];
    for (const r of clusterResult.results || []) {
      if (!r.result) continue;
      if (typeof r.result.accuracy === "number") acc.push(r.result.accuracy);
      if (typeof r.result.loss === "number") loss.push(r.result.loss);
    }
    const avgAcc = acc.reduce((a, v) => a + v, 0) / (acc.length || 1);
    const avgLoss = loss.reduce((a, v) => a + v, 0) / (loss.length || 1);
    return { avgAccuracy: avgAcc, avgLoss };
  }

  /**
   * Compress a dataset using SCXQ2 object glyphs.
   * dataset: arbitrary JSON (RLHF pairs, text chunks, etc.)
   */
  compressDataset(dataset) {
    return SCXQ2.encodeObject(dataset);
  }

  /**
   * RLHF integration: update fusion weights based on user ratings.
   * ratings: { modelName: number } e.g. { "llama-kuhul": 1, "cline-java": -1 }
   * prevWeights: { modelName: number }
   */
  updateFusionWeights(prevWeights, ratings) {
    return FusionMath.updateWeightsFromRLHF(prevWeights, ratings, 0.15);
  }
}
