// Ensemble Inference - Multi-Delta Voting (from CALL-GRAMS-DATA-HARVEST.md)

/**
 * Run inference with multiple deltas and aggregate results
 */

async function ensembleInference(query, numDeltas = 5) {
  // 1. Select top N deltas by accuracy
  const topDeltas = results.results
    .sort((a, b) => b.result.accuracy - a.result.accuracy)
    .slice(0, numDeltas)
    .map(run => run.delta_ref);

  // 2. Run inference with each delta
  const answers = await Promise.all(
    topDeltas.map(async (deltaRef) => {
      const delta = await loadSCXQ2Delta(deltaRef);
      const weights = applyDelta(BASE_WEIGHTS, delta);
      return await inference(query, weights);
    })
  );

  // 3. Vote (or aggregate)
  const finalAnswer = voteMajority(answers);

  return {
    answer: finalAnswer,
    confidence: calculateConsensus(answers),
    num_deltas: numDeltas,
    individual_answers: answers
  };
}

function voteMajority(answers) {
  // Count occurrences
  const votes = {};
  answers.forEach(answer => {
    votes[answer] = (votes[answer] || 0) + 1;
  });

  // Return most common answer
  return Object.keys(votes).reduce((a, b) =>
    votes[a] > votes[b] ? a : b
  );
}

function calculateConsensus(answers) {
  const majority = voteMajority(answers);
  const agreementCount = answers.filter(a => a === majority).length;
  return agreementCount / answers.length;
}
