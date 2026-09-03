export const STUDENT_PROFILE = {
  id: "student-1",
  name: "Deepraj Roy",
  avatarUrl: null,
  initials: "DR",
  title: "Undergraduate CS Student & Aspiring AI Engineer",
  email: "deepraj.roy@university.edu",
  phone: "+91 98765 43210",
  location: "Bangalore, India",
  readinessScore: 86,
  
  academic: {
    institution: "National Institute of Technology",
    degree: "Bachelor of Technology (B.Tech)",
    branch: "Computer Science & Engineering",
    year: "3rd Year (Class of 2027)",
    currentSemester: "6th Semester",
    cgpa: "8.85 / 10.0",
    keyCourses: ["Data Structures & Algorithms", "Linear Algebra", "Database Systems", "Operating Systems", "Artificial Intelligence"]
  },

  careerPreferences: {
    primaryGoal: "AI/ML Internship",
    targetRoles: ["Machine Learning Intern", "AI Research Assistant", "Data Science Intern", "Applied ML Engineer"],
    preferredLocation: "Bangalore / San Francisco / Hybrid",
    remotePreference: "Remote or Hybrid",
    availability: "Immediate / Summer 2026",
    minimumStipend: "$1,500/mo"
  },

  skills: [
    {
      name: "Python",
      category: "Programming",
      proficiency: "Advanced",
      confidence: 91,
      freshness: "Active this week",
      evidence: {
        projectsCount: 3,
        certificationsCount: 1,
        contributions: "148 GitHub commits in past 30 days"
      }
    },
    {
      name: "Machine Learning",
      category: "AI/ML",
      proficiency: "Intermediate",
      confidence: 84,
      freshness: "Active 4 days ago",
      evidence: {
        projectsCount: 2,
        certificationsCount: 1,
        contributions: "CNN image classification benchmark repo"
      }
    },
    {
      name: "PyTorch",
      category: "Frameworks",
      proficiency: "Intermediate",
      confidence: 79,
      freshness: "Active 1 week ago",
      evidence: {
        projectsCount: 2,
        certificationsCount: 0,
        contributions: "ResNet model implementation"
      }
    },
    {
      name: "React",
      category: "Web Frontend",
      proficiency: "Intermediate",
      confidence: 82,
      freshness: "Active 2 weeks ago",
      evidence: {
        projectsCount: 2,
        certificationsCount: 1,
        contributions: "Interactive dashboard & student portal"
      }
    },
    {
      name: "FastAPI",
      category: "Backend",
      proficiency: "Intermediate",
      confidence: 75,
      freshness: "Active 3 days ago",
      evidence: {
        projectsCount: 1,
        certificationsCount: 0,
        contributions: "REST API inference endpoints"
      }
    },
    {
      name: "Cloud Deployment",
      category: "DevOps",
      proficiency: "Beginner",
      confidence: 58,
      freshness: "Needs refresh (30 days)",
      evidence: {
        projectsCount: 1,
        certificationsCount: 0,
        contributions: "Basic AWS EC2 & S3 setup"
      }
    }
  ],

  projects: [
    {
      id: "proj-1",
      title: "Multimodal Visual QA System",
      description: "Implemented a transformer-based visual question answering pipeline combining CLIP image embeddings with language decoders.",
      technologies: ["PyTorch", "Hugging Face", "FastAPI", "Docker"],
      githubUrl: "https://github.com/deepraj/visual-qa",
      liveDemo: "https://vqa-demo.antigravity.run",
      verified: true
    },
    {
      id: "proj-2",
      title: "CNN Image Classification Benchmark",
      description: "Custom convolutional neural network trained on CIFAR-100 achieving 92.4% validation accuracy with data augmentation and dropout.",
      technologies: ["Python", "Keras", "TensorFlow", "Matplotlib"],
      githubUrl: "https://github.com/deepraj/cnn-cifar-bench",
      liveDemo: null,
      verified: true
    },
    {
      id: "proj-3",
      title: "SkillMatch AI Recommendation Engine",
      description: "Vector similarity engine matching student skill vectors against live internship specifications using cosine similarity.",
      technologies: ["Python", "NumPy", "Scikit-Learn", "React"],
      githubUrl: "https://github.com/deepraj/skillmatch-core",
      liveDemo: "https://skillmatch.antigravity.run",
      verified: true
    }
  ],

  certifications: [
    {
      id: "cert-1",
      name: "Deep Learning Specialization",
      issuer: "DeepLearning.AI / Coursera",
      issueDate: "Jan 2026",
      credentialId: "DL-8942-0192",
      verified: true
    },
    {
      id: "cert-2",
      name: "AWS Certified Cloud Practitioner",
      issuer: "Amazon Web Services",
      issueDate: "Nov 2025",
      credentialId: "AWS-CCP-7718",
      verified: true
    }
  ],

  experience: [
    {
      id: "exp-1",
      role: "Undergraduate ML Research Intern",
      organization: "Autonomous Intelligence Systems Lab",
      period: "May 2025 - Jul 2025",
      location: "Bangalore",
      description: "Benchmarked latency and model accuracy of quantized neural networks for real-time edge telemetry systems."
    },
    {
      id: "exp-2",
      role: "Technical Lead & Open Source Lead",
      organization: "Campus Developer Student Club",
      period: "Aug 2024 - Present",
      location: "Campus",
      description: "Organized 4 campus hackathons, mentored 120+ first-year students in Python programming and Git workflows."
    }
  ],

  interests: ["Generative AI", "Computer Vision", "Robotics", "Open Source", "Quantum Computing", "High Performance Computing"]
};

export const SAMPLE_EXTRACTED_RESUME = {
  fileName: "Deepraj_Roy_Resume_2026.pdf",
  uploadDate: "Today, 10:15 AM",
  parsedStatus: "SUCCESS",
  confidenceScore: 94,
  extracted: {
    fullName: "Deepraj Roy",
    email: "deepraj.roy@university.edu",
    phone: "+91 98765 43210",
    education: {
      degree: "B.Tech in Computer Science & Engineering",
      institution: "National Institute of Technology",
      graduationYear: "2027",
      cgpa: "8.85 / 10.0"
    },
    skillsDetected: [
      "Python", "PyTorch", "TensorFlow", "FastAPI", "React", "Docker", "Machine Learning", "Git", "SQL", "Linux"
    ],
    experienceSummary: "Undergraduate ML Research Intern at Autonomous Intelligence Systems Lab (3 months). Campus Club Tech Lead (18 months).",
    projectsDetected: [
      "Multimodal Visual QA System (PyTorch, FastAPI)",
      "CNN Image Classification Benchmark (92.4% Accuracy)",
      "SkillMatch Recommendation Engine"
    ],
    careerGoalDetected: "AI/ML Engineering Internship"
  }
};
