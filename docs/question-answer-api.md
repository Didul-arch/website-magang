# Question and Answer System API Documentation

This documentation covers the API endpoints for managing questions and answers in the internship application system.

## Admin Endpoints

### 1. Create Question

**POST** `/api/admin/questions`

Creates a new question with multiple choice answers for a specific vacancy.

**Request Body:**

```json
{
  "question": "What is your preferred programming language?",
  "vacancyId": 1,
  "answers": [
    {
      "answer": "JavaScript",
      "isCorrect": true
    },
    {
      "answer": "Python",
      "isCorrect": false
    },
    {
      "answer": "Java",
      "isCorrect": false
    },
    {
      "answer": "C++",
      "isCorrect": false
    }
  ]
}
```

**Response:**

```json
{
  "message": "Question created successfully",
  "data": {
    "id": 1,
    "question": "What is your preferred programming language?",
    "answer": "JavaScript",
    "vacancyId": 1,
    "answers": [
      {
        "id": 1,
        "answer": "JavaScript",
        "isCorrect": true
      }
      // ... other answers
    ]
  }
}
```

### 2. Get All Questions

**GET** `/api/admin/questions?page=1&limit=10&vacancyId=1`

Retrieves all questions with pagination and optional filtering by vacancy.

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `vacancyId` (optional): Filter by specific vacancy

### 3. Create Multiple Questions for a Vacancy

**POST** `/api/admin/vacancy/[vacancyId]/questions`

Creates multiple questions for a specific vacancy at once.

**Request Body:**

```json
{
  "questions": [
    {
      "question": "What is React?",
      "answers": [
        {
          "answer": "A JavaScript library for building user interfaces",
          "isCorrect": true
        },
        {
          "answer": "A database management system",
          "isCorrect": false
        }
      ]
    },
    {
      "question": "What does HTML stand for?",
      "answers": [
        {
          "answer": "HyperText Markup Language",
          "isCorrect": true
        },
        {
          "answer": "Home Tool Markup Language",
          "isCorrect": false
        }
      ]
    }
  ]
}
```

### 4. Update Question

**PUT** `/api/admin/questions/[questionId]`

Updates an existing question and its answers.

### 5. Delete Question

**DELETE** `/api/admin/questions/[questionId]`

Deletes a question and all its associated answers.

### 6. Get Application Results

**GET** `/api/admin/application/[applicationId]/results`

Retrieves detailed application results including quiz scores.

**Response:**

```json
{
  "message": "Application results fetched successfully",
  "data": {
    "application": {
      "id": 1,
      "status": "REVIEWED",
      "createdAt": "2025-06-29T10:00:00Z"
    },
    "applicant": {
      "name": "John Doe",
      "email": "john@example.com",
      "phoneNumber": "+1234567890"
    },
    "vacancy": {
      "title": "Frontend Developer Intern",
      "location": "Jakarta"
    },
    "quiz": {
      "totalQuestions": 5,
      "answeredQuestions": 5,
      "correctAnswers": 4,
      "score": "80.0",
      "hasAnswered": true,
      "details": [
        {
          "question": "What is React?",
          "selectedAnswer": "A JavaScript library",
          "isCorrect": true,
          "correctAnswer": "A JavaScript library"
        }
      ]
    }
  }
}
```

### 7. Update Application Status

**PUT** `/api/admin/application/[applicationId]/status`

Updates the status of an application and sends notifications to the applicant.

**Request Body:**

```json
{
  "status": "ACCEPTED",
  "reason": "Excellent performance on the technical assessment"
}
```

### 8. Get All Applications with Quiz Results

**GET** `/api/admin/applications?page=1&limit=10&vacancyId=1&status=REVIEWED`

Retrieves all applications with their quiz scores for admin dashboard.

## Internship/Applicant Endpoints

### 1. Get Questions for Application

**GET** `/api/application/[applicationId]/questions`

Retrieves questions that an applicant needs to answer for their application.

**Response:**

```json
{
  "message": "Questions fetched successfully",
  "data": {
    "application": {
      "id": 1,
      "status": "PENDING",
      "vacancyTitle": "Frontend Developer Intern"
    },
    "questions": [
      {
        "id": 1,
        "question": "What is React?",
        "answers": [
          {
            "id": 1,
            "answer": "A JavaScript library for building user interfaces"
          },
          {
            "id": 2,
            "answer": "A database management system"
          }
        ]
      }
    ],
    "hasAnswered": false,
    "score": null,
    "answers": []
  }
}
```

### 2. Submit Answers

**POST** `/api/application/[applicationId]/submit-answers`

Submits answers to the application questions.

**Request Body:**

```json
{
  "answers": [
    {
      "questionId": 1,
      "answerId": 1
    },
    {
      "questionId": 2,
      "answerId": 4
    }
  ]
}
```

**Response:**

```json
{
  "message": "Answers submitted successfully",
  "data": {
    "score": "80.0",
    "totalQuestions": 5,
    "correctAnswers": 4,
    "answers": [
      {
        "id": 1,
        "question": {
          "question": "What is React?"
        },
        "answer": {
          "answer": "A JavaScript library",
          "isCorrect": true
        }
      }
    ]
  }
}
```

## Usage Examples

### For Admin Dashboard:

1. **Create questions for a vacancy:**

```javascript
// Create multiple questions for vacancy ID 1
const response = await fetch("/api/admin/vacancy/1/questions", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    questions: [
      {
        question: "What is your experience with React?",
        answers: [
          { answer: "Beginner", isCorrect: false },
          { answer: "Intermediate", isCorrect: true },
          { answer: "Advanced", isCorrect: false },
        ],
      },
    ],
  }),
});
```

2. **Get all applications with quiz results:**

```javascript
const response = await fetch("/api/admin/applications?page=1&limit=10");
const data = await response.json();
// Use data.data to display applications in admin dashboard
```

### For Internship Applicants:

1. **Get questions for an application:**

```javascript
const response = await fetch("/api/application/123/questions");
const data = await response.json();
// Display questions in the application form
```

2. **Submit answers:**

```javascript
const response = await fetch("/api/application/123/submit-answers", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    answers: [
      { questionId: 1, answerId: 2 },
      { questionId: 2, answerId: 5 },
    ],
  }),
});
```

## Email Notifications

The system automatically sends email notifications:

1. **Application Confirmation**: When an applicant submits an application
2. **Quiz Completion**: When an applicant completes the quiz
3. **Status Updates**: When admin updates application status (ACCEPTED/REJECTED)

## Database Schema

The system uses the following models:

- `Question`: Contains the question text and correct answer
- `Answer`: Multiple choice options for each question
- `ApplicantAnswer`: Junction table storing user's selected answers
- `Application`: Links internships to vacancies and tracks status

## Error Handling

All endpoints return standardized error responses:

```json
{
  "message": "Error description",
  "errors": {
    // Validation errors if applicable
  }
}
```

Common HTTP status codes:

- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error
