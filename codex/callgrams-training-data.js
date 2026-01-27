// Training Data Generation (from CALL-GRAMS-DATA-HARVEST.md)

/**
 * Convert cluster results to training dataset
 */

function convertToTrainingData(results) {
  const trainingData = [];

  results.results.forEach((run, idx) => {
    const datapoint = {
      input: {
        model_config: {
          base: "Qwen-7B",
          epochs: run.result.epochs,
          job_index: run.job_index
        }
      },
      output: {
        loss: run.result.loss,
        accuracy: run.result.accuracy
      },
      metadata: {
        runtime: run.runtime,
        worker: idx % 8  // Assuming 8 workers
      }
    };

    trainingData.push(datapoint);
  });

  return trainingData;
}

// Export as JSONL for training
function exportTrainingDataset(results, filename) {
  const trainingData = convertToTrainingData(results);

  const jsonl = trainingData
    .map(d => JSON.stringify(d))
    .join('\n');

  fs.writeFileSync(filename, jsonl);

  console.log(`✅ Exported ${trainingData.length} training examples to ${filename}`);
  return trainingData;
}

// Usage
const dataset = exportTrainingDataset(results, 'cluster_training_data.jsonl');

// Result: cluster_training_data.jsonl
// {"input":{"model_config":{"base":"Qwen-7B","epochs":10,"job_index":0}},"output":{"loss":0.44,"accuracy":0.7779},"metadata":{"runtime":0,"worker":0}}
// {"input":{"model_config":{"base":"Qwen-7B","epochs":10,"job_index":1}},"output":{"loss":0.1028,"accuracy":0.7318},"metadata":{"runtime":1,"worker":1}}
// ... 998 more lines
