const chatbotKnowledge = [
  {
    id: 1,
    topic: "quiz",
    intent: "quiz_attempt_help",
    patterns: [
      "how do i attempt a quiz",
      "how to attempt a quiz",
      "how do i take a quiz",
      "how to take a quiz",
      "start quiz",
      "attempt quiz",
      "take quiz",
      "do a quiz"
    ],
    keywords: ["quiz", "attempt", "take", "start"],
    answer:
      "To attempt a quiz, go to the Quiz Bank page from the navigation bar, choose a quiz, answer all questions, and then click Submit. After submission, your result page will display your score.",
    steps: [
      "Open the Quiz Bank page.",
      "Select the quiz you want to attempt.",
      "Answer every question.",
      "Click the Submit button.",
      "View your score on the result page."
    ],
    suggestions: [
      "Why can't I submit my quiz?",
      "How are quiz results shown?",
      "What is the Quiz Bank?"
    ]
  },
  {
    id: 2,
    topic: "quiz",
    intent: "quiz_validation_help",
    patterns: [
      "why cant i submit my quiz",
      "why can't i submit my quiz",
      "quiz not submitting",
      "submit error",
      "i cannot submit quiz",
      "validation error",
      "unanswered question",
      "missing answer"
    ],
    keywords: ["submit", "error", "validation", "unanswered", "missing", "quiz"],
    answer:
      "You cannot submit the quiz unless all questions are answered. If any question is unanswered, the system shows an error message at the top, scrolls to the top of the page, highlights unanswered questions with a red border, and displays a message asking the user to select an answer.",
    steps: [
      "Check for questions highlighted in red.",
      "Look for the error message at the top of the page.",
      "Select an answer for each unanswered question.",
      "Try submitting the quiz again."
    ],
    suggestions: [
      "How are quiz results shown?",
      "What happens after quiz submission?",
      "How do I attempt a quiz?"
    ]
  },
  {
    id: 3,
    topic: "quiz",
    intent: "quiz_result_help",
    patterns: [
      "how are results shown",
      "where can i see results",
      "quiz result",
      "see my score",
      "view my score",
      "marks after quiz",
      "after submission"
    ],
    keywords: ["result", "results", "score", "marks", "submission", "quiz"],
    answer:
      "After the quiz is submitted, the system calculates the score and sends the user to the Quiz Result page, where the score and result summary are displayed.",
    steps: [
      "Submit the completed quiz.",
      "The system calculates the score automatically.",
      "The Quiz Result page opens.",
      "View your marks and performance summary."
    ],
    suggestions: [
      "How do I attempt a quiz?",
      "Why can't I submit my quiz?",
      "What is the Quiz Bank?"
    ]
  },
  {
    id: 4,
    topic: "quiz",
    intent: "quiz_bank_help",
    patterns: [
      "what is quiz bank",
      "quiz bank",
      "about quiz bank",
      "quiz page",
      "what does quiz bank do"
    ],
    keywords: ["quiz bank", "quiz", "bank"],
    answer:
      "The Quiz Bank is the module that allows students to browse available quizzes, open a selected quiz, attempt it, and then view results after submission.",
    steps: [
      "Open the Quiz Bank from the navigation bar.",
      "Browse the list of available quizzes.",
      "Select one to start.",
      "Complete the quiz and submit it."
    ],
    suggestions: [
      "How do I attempt a quiz?",
      "How are quiz results shown?",
      "What features does the platform have?"
    ]
  },
  {
    id: 5,
    topic: "assignments",
    intent: "assignment_help",
    patterns: [
      "where are assignments",
      "how do i find assignments",
      "assignments section",
      "view assignments",
      "assignment help"
    ],
    keywords: ["assignment", "assignments", "submission", "deadline"],
    answer:
      "Assignments are available in the Assignments section of the platform. Students can use that area to view tasks, read requirements, and check deadlines.",
    steps: [
      "Go to the Assignments section.",
      "Select the relevant course or task.",
      "Read the assignment instructions carefully.",
      "Check the deadline before submission."
    ],
    suggestions: [
      "How do I check deadlines?",
      "Where can I view courses?",
      "What features does the platform have?"
    ]
  },
  {
    id: 6,
    topic: "courses",
    intent: "course_help",
    patterns: [
      "where can i view courses",
      "how do i view courses",
      "my courses",
      "course dashboard",
      "view subjects",
      "course materials"
    ],
    keywords: ["course", "courses", "subjects", "dashboard", "materials"],
    answer:
      "Students can view their enrolled courses from the dashboard. The course area can be used to access learning materials, updates, and academic content.",
    steps: [
      "Open the dashboard.",
      "Find your enrolled courses.",
      "Select a course to view more details.",
      "Access learning materials and updates."
    ],
    suggestions: [
      "Where are assignments?",
      "How do I check deadlines?",
      "What features does the platform have?"
    ]
  },
  {
    id: 7,
    topic: "login",
    intent: "login_help",
    patterns: [
      "i cant login",
      "i can't login",
      "login problem",
      "password issue",
      "forgot password",
      "sign in problem",
      "cannot sign in"
    ],
    keywords: ["login", "sign in", "password", "credentials", "account"],
    answer:
      "If you cannot log in, first check whether you are using the correct university email and password. If the issue continues, password recovery or administrator support may be needed.",
    steps: [
      "Check your email and password carefully.",
      "Make sure Caps Lock is not causing issues.",
      "Try password recovery if available.",
      "Contact system support if the issue continues."
    ],
    suggestions: [
      "What features does the platform have?",
      "How do I view courses?",
      "Where are assignments?"
    ]
  },
  {
    id: 8,
    topic: "navigation",
    intent: "navigation_help",
    patterns: [
      "how do i navigate the website",
      "how to use the website",
      "website navigation",
      "how do i use the platform",
      "where do i go"
    ],
    keywords: ["navigate", "navigation", "website", "platform", "menu"],
    answer:
      "The platform is designed to help students move between major sections such as Quiz Bank, courses, assignments, and chatbot support using the navigation bar.",
    steps: [
      "Use the navigation bar at the top of the website.",
      "Select the module you want to access.",
      "Use page buttons and links to move between features.",
      "Return to the navigation bar to switch sections."
    ],
    suggestions: [
      "What is the Quiz Bank?",
      "Where can I view courses?",
      "What features does the platform have?"
    ]
  },
  {
    id: 9,
    topic: "platform",
    intent: "platform_features",
    patterns: [
      "what features does the platform have",
      "what can this website do",
      "platform features",
      "website features",
      "what does this system do"
    ],
    keywords: ["features", "platform", "website", "system", "modules"],
    answer:
      "The Smart Learning Platform supports students through major academic features such as course access, assignments, quiz participation, results viewing, and chatbot assistance.",
    steps: [
      "Use the dashboard to access main modules.",
      "Open courses to view learning materials.",
      "Use assignments to track academic tasks.",
      "Open Quiz Bank to attempt quizzes.",
      "Use the chatbot for guidance and support."
    ],
    suggestions: [
      "What is the Quiz Bank?",
      "How do I attempt a quiz?",
      "Where are assignments?"
    ]
  },
  {
    id: 10,
    topic: "deadline",
    intent: "deadline_help",
    patterns: [
      "how do i check deadlines",
      "where can i see deadlines",
      "deadline help",
      "quiz deadline",
      "assignment deadline"
    ],
    keywords: ["deadline", "deadlines", "due date", "quiz", "assignment"],
    answer:
      "Deadlines should be checked from the relevant course, quiz, or assignment section. Students should review submission dates carefully before completing tasks.",
    steps: [
      "Open the related course, quiz, or assignment section.",
      "Look for the displayed due date or deadline.",
      "Plan your work before the deadline.",
      "Submit before the final time limit."
    ],
    suggestions: [
      "Where are assignments?",
      "How do I attempt a quiz?",
      "Where can I view courses?"
    ]
  },
  {
    id: 11,
    topic: "chatbot",
    intent: "chatbot_help",
    patterns: [
      "what can you do",
      "how can you help me",
      "about chatbot",
      "what does the chatbot do",
      "who are you"
    ],
    keywords: ["chatbot", "help", "assistant", "support", "you"],
    answer:
      "I am the Community Chatbot for the Smart Learning Platform. I can help explain platform features, guide users through quizzes, assignments, results, login issues, and navigation.",
    steps: [
      "Ask a question about the platform.",
      "Choose one of the suggested follow-up questions.",
      "Use quick actions for common tasks."
    ],
    suggestions: [
      "How do I attempt a quiz?",
      "Why can't I submit my quiz?",
      "What features does the platform have?"
    ]
  },
  {
    id: 12,
    topic: "community",
    intent: "community_help",
    patterns: [
      "what is community chatbot",
      "community support",
      "student help",
      "how does community chatbot help"
    ],
    keywords: ["community", "student", "support", "chatbot"],
    answer:
      "The Community Chatbot is designed to support students by giving quick answers, usage guidance, and help with common tasks inside the Smart Learning Platform.",
    steps: [
      "Type your question in the chat box.",
      "Read the provided answer.",
      "Use the suggested options for related help."
    ],
    suggestions: [
      "What can you do?",
      "How do I use the platform?",
      "What features does the platform have?"
    ]
  },
  // ===== GENERAL / COMMON SENSE =====

{
  id: 13,
  topic: "greetings",
  keywords: ["hello", "hi", "hey", "hii", "heyy"],
  patterns: ["hello", "hi", "hey", "hii", "heyy"],
  answer: "Hello! How can I help you today?",
  suggestions: [
    "What is this website?",
    "How do I attempt a quiz?",
    "What features does the platform have?"
  ]
},

{
  id: 14,
  topic: "greetings",
  keywords: ["morning", "good morning"],
  patterns: ["good morning"],
  answer: "Good morning! How can I assist you today?",
  suggestions: ["What can you do?", "How do I use the platform?"]
},

{
  id: 15,
  topic: "greetings",
  keywords: ["evening", "good evening"],
  patterns: ["good evening"],
  answer: "Good evening! Feel free to ask me anything about the platform.",
  suggestions: ["What is this website?", "What can you do?"]
},

{
  id: 16,
  topic: "smalltalk",
  keywords: ["how are you"],
  patterns: ["how are you"],
  answer: "I'm doing great! I'm here to help you with anything related to the platform.",
  suggestions: ["What can you do?", "How do I attempt a quiz?"]
},

{
  id: 17,
  topic: "thanks",
  keywords: ["thanks", "thank you"],
  patterns: ["thanks", "thank you"],
  answer: "You're welcome!",
  suggestions: ["What else can you do?", "How do I attempt a quiz?"]
},

{
  id: 18,
  topic: "farewell",
  keywords: ["bye", "goodbye"],
  patterns: ["bye", "goodbye"],
  answer: "Goodbye! Come back if you need help.",
  suggestions: ["What is this website?", "How do I use the platform?"]
},

// ===== PLATFORM INFO =====

{
  id: 19,
  topic: "platform",
  keywords: ["what is this", "what is this website", "what is this app", "smart learning", "website"],
  patterns: [
    "what is this website",
    "what is this app",
    "what is this platform",
    "what is smart learning",
    "what is smart learning platform",
    "tell me about smart learning",
    "what is your website",
    "about this website"
  ],
  answer: "Smart Learning is an online learning platform that helps students manage quizzes, view results, access academic support, and use the community chatbot for guidance.",
  suggestions: ["What features does the platform have?", "How do I use it?"]
},

{
  id: 20,
  topic: "platform",
  keywords: ["purpose", "goal"],
  patterns: ["purpose of this website", "goal of this project"],
  answer: "The purpose of this platform is to provide a digital learning environment where students can complete quizzes, view results, and access academic resources easily.",
  suggestions: ["What features does the platform have?", "What technologies are used?"]
},

{
  id: 21,
  topic: "platform",
  keywords: ["features", "functions"],
  patterns: ["what features", "what does this platform do"],
  answer: "This platform includes quiz management, result tracking, assignment support, course access, and a chatbot assistant.",
  suggestions: ["How do I attempt a quiz?", "Where can I see results?"]
},

// ===== TECHNOLOGY =====

{
  id: 22,
  topic: "tech",
  keywords: ["technology", "tech stack"],
  patterns: ["what technology is used", "what tech stack"],
  answer: "This project uses React for the frontend, Spring Boot for the backend, and SQL for database management.",
  suggestions: ["What is React?", "What is Spring Boot?"]
},

{
  id: 23,
  topic: "tech",
  keywords: ["react"],
  patterns: ["what is react"],
  answer: "React is a JavaScript library used to build interactive user interfaces.",
  suggestions: ["What technologies are used?", "What is Spring Boot?"]
},

{
  id: 24,
  topic: "tech",
  keywords: ["spring", "spring boot"],
  patterns: ["what is spring boot"],
  answer: "Spring Boot is a Java framework used to build backend APIs and applications.",
  suggestions: ["What is React?", "What technologies are used?"]
},

{
  id: 25,
  topic: "tech",
  keywords: ["sql", "database"],
  patterns: ["what is sql", "database"],
  answer: "SQL is used to manage and store structured data in databases.",
  suggestions: ["What technologies are used?", "What is Spring Boot?"]
}
];

export default chatbotKnowledge;