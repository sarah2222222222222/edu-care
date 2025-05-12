const axios = require("axios");
const Assignment = require("../models/assignmentModel");
const ApiError = require("../utils/ApiError"); // Assuming you have an error handler

const createAssignment = async (req, res, next) => {
  try {
    const { subject, difficulty, questionCount = 5, instructions, type, topic, additionalDetails } = req.body;
    const userId = req.user._id;

    // Validation
    if (!subject || !difficulty || !type || !topic) {
      return next(new ApiError("Subject, difficulty, type, and topic are required", 400));
    }

    // Prepare the AI prompt
    const prompt = `
      Generate a ${difficulty} level ${subject} assignment with these requirements:
      - Title reflecting the content
      - Detailed description
      - ${questionCount} questions (mix of multiple choice and short answer)
      - Clear instructions for students
      - Rubric with grading criteria
      Format as JSON with these keys:
      {
        "title": "",
        "description": "",
        "instructions": "",
        "questions": [{
          "questionText": "",
          "questionType": "",
          "options": [],
          "correctAnswer": "",
          "points": 1
        }],
        "rubric": {
          "criteria": [{
            "name": "",
            "description": "",
            "points": 5
          }],
          "totalPoints": 100
        }
      }
      ${instructions ? `Additional instructions: ${instructions}` : ''}
    `;

    // DeepSeek API Call (You can use your own AI provider here)
    const response = await axios.post(
      process.env.DEEPSEEK_API_URL || "https://api.deepseek.com/v1/chat/completions", // Example URL
      {
        model: process.env.DEEPSEEK_MODEL || "deepseek-chat", // AI model used
        messages: [
          { role: "system", content: "You are an expert educator that generates perfect assignment structures." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`, // Set your API key here
          "Content-Type": "application/json"
        }
      }
    );

    // Parse and validate the response
    let assignmentData;
    try {
      assignmentData = JSON.parse(response.data.choices[0].message.content);
      
      // Basic validation
      if (!assignmentData.title || !assignmentData.questions) {
        throw new Error("Invalid assignment structure from AI");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      throw new ApiError("Failed to process AI-generated assignment", 500);
    }

    // Create the assignment in the database
    const newAssignment = await Assignment.create({
      type,
      topic,
      additionalDetails,
      subject,
      difficulty,
      questionCount,
      instructions,
      description: assignmentData.description,
      title: assignmentData.title,
      User: userId,
      isAIGenerated: true,
      aiModelUsed: process.env.DEEPSEEK_MODEL || "deepseek-chat"
    });

    // Return the created assignment
    res.status(201).json({
      success: true,
      data: newAssignment
    });

  } catch (error) {
    console.error("Assignment generation error:", error);
    
    // Handle API errors
    if (error.response) {
      if (error.response.status === 429) {
        return next(new ApiError("AI service rate limit exceeded", 429));
      }
      if (error.response.status === 401) {
        return next(new ApiError("Invalid AI API credentials", 401));
      }
    }

    next(error instanceof ApiError ? error : new ApiError("Assignment generation failed", 500));
  }
};

module.exports = { createAssignment };
