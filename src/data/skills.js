export const VERIFIED_SKILLS = [
  {
    id: "sk-1",
    name: "Python",
    category: "Languages",
    proficiency: "Advanced",
    confidence: 91,
    evidence: {
      projectsCount: 3,
      certificationsCount: 1,
      activity: "148 commits in past 30 days"
    },
    freshness: "Active this week",
    marketDemand: "Extremely High",
    endorsements: 14
  },
  {
    id: "sk-2",
    name: "Machine Learning",
    category: "AI & Data",
    proficiency: "Intermediate",
    confidence: 84,
    evidence: {
      projectsCount: 2,
      certificationsCount: 1,
      activity: "CNN benchmark repo"
    },
    freshness: "Active 4 days ago",
    marketDemand: "Extremely High",
    endorsements: 11
  },
  {
    id: "sk-3",
    name: "PyTorch",
    category: "Frameworks",
    proficiency: "Intermediate",
    confidence: 79,
    evidence: {
      projectsCount: 2,
      certificationsCount: 0,
      activity: "ResNet implementation"
    },
    freshness: "Active 1 week ago",
    marketDemand: "High",
    endorsements: 8
  },
  {
    id: "sk-4",
    name: "React",
    category: "Web Frontend",
    proficiency: "Intermediate",
    confidence: 82,
    evidence: {
      projectsCount: 2,
      certificationsCount: 1,
      activity: "Full portal & components"
    },
    freshness: "Active 2 weeks ago",
    marketDemand: "High",
    endorsements: 9
  },
  {
    id: "sk-5",
    name: "FastAPI",
    category: "Backend",
    proficiency: "Intermediate",
    confidence: 75,
    evidence: {
      projectsCount: 1,
      certificationsCount: 0,
      activity: "Inference API endpoints"
    },
    freshness: "Active 3 days ago",
    marketDemand: "High",
    endorsements: 6
  },
  {
    id: "sk-6",
    name: "Cloud Deployment",
    category: "Infrastructure",
    proficiency: "Beginner",
    confidence: 58,
    evidence: {
      projectsCount: 1,
      certificationsCount: 0,
      activity: "AWS EC2 setup"
    },
    freshness: "Needs refresh (30 days)",
    marketDemand: "High",
    endorsements: 4
  }
];

export const SKILL_GAPS = [
  {
    id: "gap-1",
    skillName: "TensorFlow",
    priority: "Critical",
    priorityColor: "text-error bg-error-container text-on-error-container",
    badgeType: "error",
    currentLevel: "Beginner",
    requiredLevel: "Advanced",
    gapDescription: "Current: Beginner → Required: Advanced",
    estimatedEffort: "~14 hrs",
    targetRole: "AI/ML Intern at TechNova & DeepMind",
    recommendedAction: "Complete Course: DeepLearning.AI TensorFlow in Practice (Modules 1-3)",
    actionLink: "/discover?category=courses",
    curriculumModule: "Weeks 1-2 in Roadmap"
  },
  {
    id: "gap-2",
    skillName: "Docker & Containerization",
    priority: "Important",
    priorityColor: "text-on-secondary-container bg-secondary-container",
    badgeType: "warning",
    currentLevel: "None",
    requiredLevel: "Intermediate",
    gapDescription: "Current: None → Required: Intermediate",
    estimatedEffort: "~8 hrs",
    targetRole: "ML Infra & Production Deployment",
    recommendedAction: "Hands-on lab: Package FastAPI Inference in Multi-stage Dockerfile",
    actionLink: "/roadmap",
    curriculumModule: "Week 5 in Roadmap"
  },
  {
    id: "gap-3",
    skillName: "Cloud Deployment (AWS/GCP)",
    priority: "Preferred",
    priorityColor: "text-outline bg-surface-container-high",
    badgeType: "neutral",
    currentLevel: "Beginner",
    requiredLevel: "Intermediate",
    gapDescription: "Current: Beginner → Required: Intermediate",
    estimatedEffort: "~6 hrs",
    targetRole: "Cloud-native ML Systems",
    recommendedAction: "Deploy Dockerized model to AWS App Runner or Google Cloud Run",
    actionLink: "/roadmap",
    curriculumModule: "Week 6 in Roadmap"
  },
  {
    id: "gap-4",
    skillName: "Vector Databases & LangChain",
    priority: "Important",
    priorityColor: "text-on-secondary-container bg-secondary-container",
    badgeType: "warning",
    currentLevel: "Beginner",
    requiredLevel: "Advanced",
    gapDescription: "Current: Beginner → Required: Advanced",
    estimatedEffort: "~10 hrs",
    targetRole: "GenAI Research Assistant at Google Cloud",
    recommendedAction: "Build Multimodal RAG Assistant project using Chroma/Milvus",
    actionLink: "/discover?category=projects",
    curriculumModule: "Recommended Projects"
  }
];

export const RECOMMENDED_PROJECTS = [
  {
    id: "rp-1",
    title: "Multimodal RAG Assistant with LangChain & Milvus",
    difficulty: "Intermediate",
    estimatedDuration: "10-14 days",
    skillsTargeted: ["LangChain", "Vector Databases", "FastAPI", "Docker"],
    addressesGaps: ["Vector Databases & LangChain", "Docker & Containerization"],
    impact: "+14% Boost to GenAI Research Match",
    description: "Build an end-to-end question-answering tool over complex PDF research papers with charts and equation parsing.",
    steps: [
      "Extract structured text and visual bounding boxes using PyMuPDF",
      "Generate embeddings using CLIP and OpenAI text-embedding-3",
      "Store and query embeddings in local Milvus / Chroma instance",
      "Deploy backend with FastAPI and containerize using Docker"
    ]
  },
  {
    id: "rp-2",
    title: "High-Throughput Model Serving Microservice",
    difficulty: "Intermediate",
    estimatedDuration: "7-10 days",
    skillsTargeted: ["FastAPI", "Docker", "Model Evals", "Cloud Deployment"],
    addressesGaps: ["Docker & Containerization", "Cloud Deployment (AWS/GCP)"],
    impact: "+18% Boost to Cloud & ML Infra Roles",
    description: "Package a PyTorch sentiment model into an asynchronous REST microservice with batching, health checks, and Prometheus metrics.",
    steps: [
      "Implement dynamic batching inference worker",
      "Write multi-stage Dockerfile minimizing image size to <300MB",
      "Set up GitHub Actions CI/CD to build and push image",
      "Deploy to cloud container service with load balancing"
    ]
  },
  {
    id: "rp-3",
    title: "TensorFlow 2.x Vision Transformer From Scratch",
    difficulty: "Advanced",
    estimatedDuration: "12-16 days",
    skillsTargeted: ["TensorFlow", "Computer Vision", "Deep Learning"],
    addressesGaps: ["TensorFlow"],
    impact: "+22% Boost to DeepMind & TechNova AI Roles",
    description: "Implement patch extraction, self-attention blocks, and classification head using pure TensorFlow without high-level library shortcuts.",
    steps: [
      "Implement linear projection of flattened patches",
      "Build multi-head self-attention module with custom training loop",
      "Benchmark against standard ResNet-50 on ImageNet mini",
      "Publish comprehensive technical writeup on GitHub"
    ]
  }
];
