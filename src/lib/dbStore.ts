// 🛠️ Centralized global memory store for developer mock fallback
// Next.js loads API endpoints in separate chunks/threads. Attaching this to globalThis
// guarantees that all endpoints share the exact same dataset, and prevents hot reloads
// from clearing out recent assessment scores.

interface GlobalWithAssessments {
  inMemoryAssessmentsStore?: any[];
}

const g = globalThis as unknown as GlobalWithAssessments;

if (!g.inMemoryAssessmentsStore) {
  g.inMemoryAssessmentsStore = [];
}

export const inMemoryAssessments = g.inMemoryAssessmentsStore;
