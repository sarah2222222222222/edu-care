class AssignmentDto {
  static format(assignment) {
    return {
      id: assignment._id,
      title: assignment.title,
      subject: assignment.subject,
      topic: assignment.topic,
      level: assignment.level,
      questionCount: assignment.questionCount,
      createdAt: assignment.formattedDate,
      content: assignment.content,
      isPublic: assignment.isPublic,
      author: assignment.generatedBy?.name || "System",
    };
  }

  static formatForList(assignments) {
    return assignments.map((ass) => ({
      id: ass._id,
      title: ass.title,
      subject: ass.subject,
      topic: ass.topic,
      level: ass.level,
      questionCount: ass.questionCount,
    }));
  }
}

module.exports = AssignmentDto;
