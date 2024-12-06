const QuestionTypeSelector = ({ onSelect, onClose }) => {
  const questionTypes = [
    {
      type: "Categorize",
      description: "Sort items into categories",
    },
    {
      type: "Cloze",
      description: "Fill in the blanks in a passage",
    },
    {
      type: "Comprehension",
      description: "Answer questions based on a passage",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-4 p-4 bg-white shadow-lg rounded-lg">
      {questionTypes.map((type) => (
        <div
          key={type.type}
          onClick={() => {
            onSelect(type.type);
            onClose();
          }}
          className="border rounded-lg p-4 cursor-pointer hover:bg-gray-100 transition"
        >
          <h3 className="font-bold">{type.type}</h3>
          <p className="text-sm text-gray-600">{type.description}</p>
        </div>
      ))}
    </div>
  );
};

export default QuestionTypeSelector;
