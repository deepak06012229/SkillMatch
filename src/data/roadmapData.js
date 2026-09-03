export const ROADMAP_GOAL = {
  title: "Become internship-ready for AI/ML roles in 10 weeks",
  badge: "AI Career Agent Active",
  description: "Personalized curriculum dynamically updated based on your verified skills, GitHub commit telemetry, and real-time job market criteria.",
  currentWeek: 7,
  totalWeeks: 10,
  percentComplete: 70,
  hoursLogged: 81,
  estimatedTotalHours: 115,
  targetRoles: ["Machine Learning Intern", "GenAI Research Assistant"],
  nextMilestoneInDays: 3
};

export const ROADMAP_WEEKS = [
  {
    weekLabel: "Weeks 1-2",
    title: "TensorFlow Fundamentals & Tensor Operations",
    description: "Master core tensor manipulations, automatic differentiation, loss functions, and foundational neural network architectures using TensorFlow 2.x.",
    skills: ["TensorFlow", "NumPy", "Linear Algebra"],
    status: "completed",
    completedDate: "Completed on Mar 12",
    estimatedHours: "24 hrs estimated",
    actionLabel: "Review Notes",
    actionType: "link",
    deliverables: [
      "Custom tensor gradient tape implementations",
      "Multilayer Perceptron from scratch"
    ]
  },
  {
    weekLabel: "Weeks 3-4",
    title: "Build Computer Vision Project (CNN Image Classification)",
    description: "Develop a custom Convolutional Neural Network from scratch to classify complex image datasets with >92% validation accuracy on CIFAR-100.",
    skills: ["CNNs", "Computer Vision", "Keras", "Data Augmentation"],
    status: "completed",
    completedDate: "Completed on Mar 28",
    estimatedHours: "30 hrs estimated",
    actionLabel: "View GitHub Repo",
    actionType: "link",
    deliverables: [
      "Trained model checkpoint with weights",
      "Interactive confusion matrix analysis"
    ]
  },
  {
    weekLabel: "Week 5",
    title: "Dockerize Model & Containerization",
    description: "Package trained machine learning models into lightweight, reproducible Docker containers ensuring consistent production runtime execution.",
    skills: ["Docker", "Containerization", "Linux CLI"],
    status: "completed",
    completedDate: "Completed on Apr 04",
    estimatedHours: "12 hrs estimated",
    actionLabel: "View Dockerfile Artifact",
    actionType: "link",
    deliverables: [
      "Optimized multi-stage Dockerfile (<320MB)",
      "Automated container build script"
    ]
  },
  {
    weekLabel: "Week 6",
    title: "Deploy REST API with FastAPI",
    description: "Expose model inference pipelines through high-performance asynchronous REST endpoints with schema validation and automated Swagger documentation.",
    skills: ["FastAPI", "REST APIs", "Uvicorn", "Pydantic"],
    status: "completed",
    completedDate: "Completed on Apr 11",
    estimatedHours: "15 hrs estimated",
    actionLabel: "Test Swagger Endpoint",
    actionType: "link",
    deliverables: [
      "POST /predict batched inference endpoint",
      "Automated unit tests with pytest"
    ]
  },
  {
    weekLabel: "Week 7 (Current)",
    title: "GitHub Portfolio & Resume Optimization",
    description: "Refining repository READMEs, recording demo GIF walkthroughs, and aligning project metrics with ATS algorithms for top AI research roles.",
    skills: ["Portfolio Engineering", "ATS Optimization", "Documentation"],
    status: "current",
    completedDate: "Active milestone",
    estimatedHours: "10 hrs (6 hrs logged)",
    actionLabel: "Action Hub",
    actionType: "action",
    deliverables: [
      "Professional project architecture diagrams",
      "Quantitative metric highlights in resume bullet points"
    ],
    checklist: [
      { id: "c-1", title: "README Template Check & Badges", done: true },
      { id: "c-2", title: "Optimize Commit History & Reproducibility", done: true },
      { id: "c-3", title: "Embed Architecture Diagram & Latency Charts", done: false },
      { id: "c-4", title: "Run SkillMatch ATS Compatibility Scanner", done: false }
    ]
  },
  {
    weekLabel: "Week 8",
    title: "Mock Technical Assessment & ML System Design",
    description: "Simulate rigorous technical interviews covering distributed training trade-offs, vector search indexing, and real-time inference latency optimization.",
    skills: ["System Design", "Vector Search", "Mock Interviews"],
    status: "upcoming",
    completedDate: "Starts in 3 days",
    estimatedHours: "16 hrs estimated",
    actionLabel: "Preview Assessment",
    actionType: "preview",
    deliverables: [
      "Timed coding challenge practice",
      "System design diagram walkthrough"
    ]
  },
  {
    weekLabel: "Weeks 9-10",
    title: "High-Match Internship Applications & Referrals",
    description: "Submit customized applications to top verified matches (TechNova, DeepMind, Google Cloud) with verified SkillMatch endorsements and proof-of-work links.",
    skills: ["Targeted Applications", "Networking", "Cover Letters"],
    status: "upcoming",
    completedDate: "Upcoming final sprint",
    estimatedHours: "20 hrs estimated",
    actionLabel: "View Matched Queue",
    actionType: "preview",
    deliverables: [
      "5 direct high-confidence internship submissions",
      "Alumni outreach follow-ups"
    ]
  }
];
