// Meshchain as Training Ledger (from CALL-GRAMS-DATA-HARVEST.md)

/**
 * Walk the meshchain to trace model evolution
 */

async function traceMeshchain(currentHash) {
  const chain = [];
  let hash = currentHash;

  while (hash) {
    const block = await fetchMeshchainBlock(hash);
    chain.unshift(block);
    hash = block.chain.prev_hash;
  }

  return chain;
}

async function fetchMeshchainBlock(hash) {
  // Fetch from cluster results or blockchain storage
  const response = await fetch(`/api/meshchain/${hash}`);
  return response.json();
}

// Usage
const trainingLineage = await traceMeshchain("scxq2:7a91c2f91bb1d4e7");

// Result:
// [
//   { height: 1, hash: "scxq2:abc...", metrics: {...}, model: "Qwen-7B-base" },
//   { height: 2, hash: "scxq2:def...", metrics: {...}, model: "Qwen-7B-finetune-1" },
//   ...
//   { height: 42, hash: "scxq2:7a9...", metrics: {...}, model: "Rombos-Coder-V2.5-Qwen-7b" }
// ]

console.log(`Model evolved through ${trainingLineage.length} training runs`);
console.log(`Accuracy improved from ${trainingLineage[0].metrics.avg_accuracy} to ${trainingLineage[42].metrics.avg_accuracy}`);
