const questionFiles = import.meta.glob("../questions/**/*.json", {
  eager: true,
  import: "default",
});

function getQuestionFiles(node) {
  const ownFile = node.questionFile ? [node.questionFile] : [];
  const childFiles = (node.children ?? []).flatMap(getQuestionFiles);

  return [...ownFile, ...childFiles];
}

function getQuestions(questionFilePaths) {
  return questionFilePaths.flatMap((questionFilePath) => {
    const filePath = `../questions/${questionFilePath}`;
    const questions = questionFiles[filePath];

    return Array.isArray(questions) ? questions : [];
  });
}

function shuffleQuestions(questions) {
  const shuffled = [...questions];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));

    [shuffled[index], shuffled[randomIndex]] = [
      shuffled[randomIndex],
      shuffled[index],
    ];
  }

  return shuffled;
}

export default function generateQuiz(currentNode, rootNode, shuffleLesson) {
  const selectedNode = currentNode.type === "exam" ? rootNode : currentNode;
  const questionFilePaths = getQuestionFiles(selectedNode);
  const availableQuestions = getQuestions(questionFilePaths);
  const questions =
    currentNode.type === "lesson"
      ? shuffleLesson
        ? shuffleQuestions(availableQuestions)
        : availableQuestions
      : shuffleQuestions(availableQuestions).slice(0, 50);

  if (questions.length === 0) {
    return null;
  }

  return {
    title: currentNode.title,
    questions,
    currentQuestion: 0,
    answers: {},
    score: 0,
  };
}
