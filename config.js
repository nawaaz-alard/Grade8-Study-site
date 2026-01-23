const siteConfig = {
    userName: "Student",
    googleClientId: "895631263906-0m54r2mfu8aatr5jq9qlnmrl0c78m72g.apps.googleusercontent.com",
    // BACKEND API URL
    apiBaseUrl: "http://localhost:7071/api",
    useMockApi: true, // Set to true for local testing without backend
    paystackPublicKey: "pk_test_xXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXx", // Replace with your Public Key
    securityPin: "1234", // Secondary Authentication PIN
    // Set your next big exam date here (YYYY-MM-DD or YYYY-MM-DDTHH:MM)
    examDate: "2025-11-15T09:00",
    examName: "Final Exams",
    motivationalQuotes: [
        "Believe you can and you're halfway there.",
        "Success is the sum of small efforts, repeated day in and day out.",
        "The future belongs to those who believe in the beauty of their dreams.",
        "Don't watch the clock; do what it does. Keep going.",
        "Start where you are. Use what you have. Do what you can."
    ],
    // Cambridge Lower Secondary (Grade 8) Subjects
    // Same subjects for every term as requested
    links: [
        // TERM 1
        { term: 1, subject: "Mathematics", topic: "Quiz Site", url: "../Math-quiz-site/index.html", icon: "fa-calculator" },
        { term: 1, subject: "English", topic: "Quiz Site", url: "#", icon: "fa-book" },
        { term: 1, subject: "Biology", topic: "Quiz Site", url: "#", icon: "fa-dna" },
        { term: 1, subject: "Chemistry", topic: "Quiz Site", url: "#", icon: "fa-flask" },
        { term: 1, subject: "Physics", topic: "Quiz Site", url: "#", icon: "fa-atom" },
        { term: 1, subject: "Geography", topic: "Quiz Site", url: "#", icon: "fa-earth-americas" },
        { term: 1, subject: "History", topic: "Quiz Site", url: "#", icon: "fa-landmark" },
        { term: 1, subject: "ICT", topic: "Quiz Site", url: "#", icon: "fa-laptop-code" },
        { term: 1, subject: "Global Perspectives", topic: "Quiz Site", url: "#", icon: "fa-people-group" },
        { term: 1, subject: "Second Language", topic: "Quiz Site", url: "#", icon: "fa-language" },

        // TERM 2
        { term: 2, subject: "Mathematics", topic: "Quiz Site", url: "#", icon: "fa-calculator" },
        { term: 2, subject: "English", topic: "Quiz Site", url: "#", icon: "fa-book" },
        { term: 2, subject: "Biology", topic: "Quiz Site", url: "#", icon: "fa-dna" },
        { term: 2, subject: "Chemistry", topic: "Quiz Site", url: "#", icon: "fa-flask" },
        { term: 2, subject: "Physics", topic: "Quiz Site", url: "#", icon: "fa-atom" },
        { term: 2, subject: "Geography", topic: "Quiz Site", url: "#", icon: "fa-earth-americas" },
        { term: 2, subject: "History", topic: "Quiz Site", url: "#", icon: "fa-landmark" },
        { term: 2, subject: "ICT", topic: "Quiz Site", url: "#", icon: "fa-laptop-code" },
        { term: 2, subject: "Global Perspectives", topic: "Quiz Site", url: "#", icon: "fa-people-group" },
        { term: 2, subject: "Second Language", topic: "Quiz Site", url: "#", icon: "fa-language" },

        // TERM 3
        { term: 3, subject: "Mathematics", topic: "Quiz Site", url: "#", icon: "fa-calculator" },
        { term: 3, subject: "English", topic: "Quiz Site", url: "#", icon: "fa-book" },
        { term: 3, subject: "Biology", topic: "Quiz Site", url: "#", icon: "fa-dna" },
        { term: 3, subject: "Chemistry", topic: "Quiz Site", url: "#", icon: "fa-flask" },
        { term: 3, subject: "Physics", topic: "Quiz Site", url: "#", icon: "fa-atom" },
        { term: 3, subject: "Geography", topic: "Quiz Site", url: "#", icon: "fa-earth-americas" },
        { term: 3, subject: "History", topic: "Quiz Site", url: "#", icon: "fa-landmark" },
        { term: 3, subject: "ICT", topic: "Quiz Site", url: "#", icon: "fa-laptop-code" },
        { term: 3, subject: "Global Perspectives", topic: "Quiz Site", url: "#", icon: "fa-people-group" },
        { term: 3, subject: "Second Language", topic: "Quiz Site", url: "#", icon: "fa-language" },

        // TERM 4
        { term: 4, subject: "Mathematics", topic: "Quiz Site", url: "https://nawaaz-alard.github.io/Math-quiz-site/", icon: "fa-calculator" },
        { term: 4, subject: "English", topic: "Quiz Site", url: "#", icon: "fa-book" },
        { term: 4, subject: "Biology", topic: "Quiz Site", url: "#", icon: "fa-dna" },
        { term: 4, subject: "Chemistry", topic: "Quiz Site", url: "#", icon: "fa-flask" },
        { term: 4, subject: "Physics", topic: "Quiz Site", url: "#", icon: "fa-atom" },
        { term: 4, subject: "Geography", topic: "Quiz Site", url: "#", icon: "fa-earth-americas" },
        { term: 4, subject: "History", topic: "Quiz Site", url: "#", icon: "fa-landmark" },
        { term: 4, subject: "ICT", topic: "Quiz Site", url: "#", icon: "fa-laptop-code" },
        { term: 4, subject: "Global Perspectives", topic: "Quiz Site", url: "#", icon: "fa-people-group" },
        { term: 4, subject: "Second Language", topic: "Quiz Site", url: "#", icon: "fa-language" }
    ]
};
