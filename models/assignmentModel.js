const mongoose = require('mongoose');

// Define the schema for Assignment
const assignmentSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ['material', 'assignment'], // Allow only 'material' or 'assignment' types
    required: true 
  },
  topic: { 
    type: String, 
    required: true 
  },
  additionalDetails: { 
    type: String, 
    default: '' 
  },
  description: { 
    type: String, 
    required: true 
  },
  subject: { 
    type: String, 
    required: true 
  },
  difficulty: { 
    type: String, 
    required: true 
  },
  questionCount: { 
    type: Number, 
    default: 5 // Default to 5 questions if not provided
  },
  instructions: { 
    type: String, 
    default: '' 
  },
  User: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  isAIGenerated: { 
    type: Boolean, 
    default: false // To track if the content is AI-generated
  },
  aiModelUsed: { 
    type: String, 
    default: '' // Track the AI model used, if applicable
  },
  createdAt: { 
    type: Date, 
    default: Date.now
  }
});

module.exports = mongoose.model('Assignment', assignmentSchema);
