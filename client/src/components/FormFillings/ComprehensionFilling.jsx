const ComprehensionFilling = ({ question, response, onResponseUpdate }) => {
  const handleOptionSelect = (questionIndex, selectedOption) => {
    const updatedResponse = response ? [...response] : [];
    updatedResponse[questionIndex] = selectedOption;
    onResponseUpdate(updatedResponse);
  };

  return (
    <div className="mb-6 shadow-md p-2 rounded-md">
      <h2 className="text-xl font-semibold mb-4">{question.content.title}</h2>
      
      {question.content.imageUrl && (
        <div className="mb-4">
          <img 
            src={question.content.imageUrl} 
            alt="Comprehension Question Illustration" 
            className="w-full h-48 object-scale-down rounded-lg mb-4" 
          />
        </div>
      )}
      
      <div className="mb-4 text-lg bg-gray-100 p-4 rounded">
        {question.content.passage}
      </div>

      {question.content.questions.map((q, questionIndex) => (
        <div key={questionIndex} className="mb-4">
          <p className="font-medium mb-2">{q.question}</p>
          <div className="grid grid-cols-2 gap-2">
            {q.options.map((option, optionIndex) => (
              <button
                key={optionIndex}
                onClick={() => handleOptionSelect(questionIndex, option)}
                className={`px-4 py-2 rounded ${
                  response?.[questionIndex] === option 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ComprehensionFilling;