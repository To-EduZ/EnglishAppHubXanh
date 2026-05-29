// 🛠️ Centralized global memory store for developer mock fallback
// Next.js loads API endpoints in separate chunks/threads. Attaching this to globalThis
// guarantees that all endpoints share the exact same dataset, and prevents hot reloads
// from clearing out recent assessment scores.

interface GlobalWithAssessments {
  inMemoryAssessmentsStore?: any[];
  inMemoryQuestionsStore?: any[];
}

const g = globalThis as unknown as GlobalWithAssessments;

if (!g.inMemoryAssessmentsStore) {
  g.inMemoryAssessmentsStore = [];
}

if (!g.inMemoryQuestionsStore) {
  g.inMemoryQuestionsStore = [
    {
      id: "ST_P1_01",
      level: "Movers",
      part: 1,
      type: "Scene_Description",
      imagePath: "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg",
      contextTags: ["animal", "sleeping"],
      examinerScript: "Look at the picture. Where is the cat?",
      evaluationCriteria: {
        expectedKeywords: ["cat", "sleeping", "mat"],
        targetGrammar: ["The cat is on the mat", "It is sleeping"]
      },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "MV_P2_01",
      level: "Movers",
      part: 2,
      type: "Storytelling",
      imagePath: "https://res.cloudinary.com/demo/image/upload/w_200,h_200,c_fill/v1312461204/sample.jpg",
      contextTags: ["monkey", "climbing"],
      examinerScript: "Look at the monkey. What is it doing?",
      evaluationCriteria: {
        expectedKeywords: ["monkey", "climbing", "tree"],
        targetGrammar: ["The monkey is climbing the tree", "It is eating banana"]
      },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "ST_P1_43",
      level: "Movers",
      part: 1,
      type: "Object_Card",
      imagePath: "https://res.cloudinary.com/dupquwf3j/image/upload/v1779977776/hubxanh_yle_pdf_digitalizer/ST_P1_43_1779977774734.jpg",
      contextTags: ["nature", "pond"],
      examinerScript: "What is this? Yes, it's a frog. What color is it?",
      evaluationCriteria: {
        expectedKeywords: ["frog", "mushroom", "pink"],
        targetGrammar: ["It is a green frog", "There is a pink mushroom"]
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];
}

export const inMemoryAssessments = g.inMemoryAssessmentsStore;
export const inMemoryQuestions = g.inMemoryQuestionsStore;
