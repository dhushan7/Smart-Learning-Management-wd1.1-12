const quizzes = [
  {
    id: 1,
    title: "Java Basics",
    subject: "OOP",
    videoTitle: "Introduction to Java",
    questions: [
      {
        id: 1,
        questionText: "What is Java?",
        options: ["Programming Language", "Browser", "Database", "Operating System"],
        correctAnswer: "Programming Language"
      },
      {
        id: 2,
        questionText: "Which keyword is used to define a class in Java?",
        options: ["function", "define", "class", "object"],
        correctAnswer: "class"
      },
      {
        id: 3,
        questionText: "Java is mainly known as a _____ language.",
        options: ["markup", "programming", "query", "styling"],
        correctAnswer: "programming"
      },
      {
        id: 4,
        questionText: "Which symbol is used to end a statement in Java?",
        options: [".", ";", ":", ","],
        correctAnswer: ";"
      },
      {
        id: 5,
        questionText: "Which one is a valid access modifier in Java?",
        options: ["private", "hidden", "secure", "internal"],
        correctAnswer: "private"
      }
    ]
  },
  {
    id: 2,
    title: "React Basics",
    subject: "Frontend",
    videoTitle: "React Introduction",
    questions: [
      {
        id: 1,
        questionText: "React is mainly used for building _____",
        options: ["databases", "user interfaces", "operating systems", "servers only"],
        correctAnswer: "user interfaces"
      },
      {
        id: 2,
        questionText: "React uses _____ to build UI.",
        options: ["components", "tables", "queries", "routers only"],
        correctAnswer: "components"
      },
      {
        id: 3,
        questionText: "Which function hook stores state in React?",
        options: ["useFetch", "useState", "usePage", "useData"],
        correctAnswer: "useState"
      },
      {
        id: 4,
        questionText: "JSX is used inside React to write _____",
        options: ["SQL", "HTML-like UI code", "Java classes", "CSS only"],
        correctAnswer: "HTML-like UI code"
      },
      {
        id: 5,
        questionText: "A React app usually starts from a root _____",
        options: ["component", "database", "compiler", "browser tab"],
        correctAnswer: "component"
      }
    ]
  },
  {
    id: 3,
    title: "Database Basics",
    subject: "DBMS",
    videoTitle: "Introduction to Databases",
    questions: [
      {
        id: 1,
        questionText: "SQL stands for _____",
        options: [
          "Structured Query Language",
          "Simple Question Language",
          "System Query Logic",
          "Standard Quick Language"
        ],
        correctAnswer: "Structured Query Language"
      },
      {
        id: 2,
        questionText: "A table in a database contains _____",
        options: ["rows and columns", "only images", "only functions", "routes"],
        correctAnswer: "rows and columns"
      },
      {
        id: 3,
        questionText: "Which command is used to read data?",
        options: ["SELECT", "REMOVE", "CLEAR", "PUSH"],
        correctAnswer: "SELECT"
      },
      {
        id: 4,
        questionText: "A primary key should be _____",
        options: ["duplicate", "null always", "unique", "optional always"],
        correctAnswer: "unique"
      },
      {
        id: 5,
        questionText: "Which database is relational?",
        options: ["MySQL", "Photoshop", "React", "Figma"],
        correctAnswer: "MySQL"
      }
    ]
  }
];

export default quizzes;