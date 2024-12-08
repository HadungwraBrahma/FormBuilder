import { useState, useEffect } from "react";
import { useForm } from "../context/FormContext";
import { useNavigate } from "react-router-dom";
import Categorize from "./QuestionTypes/Categorize";
import Cloze from "./QuestionTypes/Cloze";
import Comprehension from "./QuestionTypes/Comprehension";
import { PlusIcon, TrashIcon, LoaderIcon } from "lucide-react";
import QuestionTypeSelector from "./QuestionTypeSelector.jsx";

const FormEditor = () => {
  const [formTitle, setFormTitle] = useState("");
  const [questions, setQuestions] = useState([]);
  const [showQuestionTypeSelector, setShowQuestionTypeSelector] =
    useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { createForm, setFormQuestions } = useForm();
  const navigate = useNavigate();

  const handleResponseChange = (index, questionData) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = questionData;
    setQuestions(updatedQuestions);
  };

  const handleAddQuestion = (type) => {
    const newQuestion = {
      type,
      content: {
        title: `New ${type} Question`,
        ...(type === "Categorize" && {
          categories: [],
          items: [],
        }),
        ...(type === "Cloze" && {
          sentence: "",
          options: [],
        }),
        ...(type === "Comprehension" && {
          passage: "",
          questions: [],
        }),
      },
    };

    setQuestions((prevQuestions) => {
      const updatedQuestions = [...prevQuestions, newQuestion];
      return updatedQuestions.map((question, index) => ({
        ...question,
        content: {
          ...question.content,
          title: `Question ${index + 1}`,
        },
      }));
    });
  };

  useEffect(() => {
    // Safely renumber questions whenever the questions array changes
    const updatedQuestions = questions.map((question, index) => ({
      ...question,
      content: {
        ...question.content,
        title: `Question ${index + 1}`,
      },
    }));

    setFormQuestions(updatedQuestions);
  }, [questions, setFormQuestions]);

  const handleRemoveQuestion = (index) => {
    const updatedQuestions = questions
      .filter((_, i) => i !== index)
      .map((question, newIndex) => ({
        ...question,
        content: {
          ...question.content,
          title: `Question ${newIndex + 1}`,
        },
      }));

    setQuestions(updatedQuestions);
  };

  // Rest of the component remains the same as in the previous example
  const handleSaveForm = async () => {
    if (!formTitle) {
      alert("Please enter a form title");
      return;
    }

    try {
      setIsLoading(true);
      const formData = {
        title: formTitle,
      };

      const savedForm = await createForm(formData);
      navigate(`/form/${savedForm._id}`);
    } catch (error) {
      console.error("Error saving form:", error);
      alert("Failed to save form");
    } finally {
      setIsLoading(false);
    }
  };

  const renderQuestionComponent = (question, index) => {
    const questionProps = {
      key: index,
      question: question,
      onResponseChange: handleResponseChange,
      index: index,
    };

    switch (question.type) {
      case "Categorize":
        return <Categorize key={questionProps.index} {...questionProps} />;
      case "Cloze":
        return <Cloze {...questionProps} />;
      case "Comprehension":
        return <Comprehension {...questionProps} />;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-6">Form Builder</h1>

        {/* Form Title */}
        <div className="mb-4">
          <label className="block mb-2 font-semibold">Form Title</label>
          <input
            type="text"
            placeholder="Enter Form Title"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            className="w-full border rounded p-2"
          />
        </div>

        {/* Questions Section */}
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-4">Questions</h2>

          {questions.map((question, index) => (
            <div key={index} className="mb-4 relative">
              <button
                onClick={() => handleRemoveQuestion(index)}
                className="absolute top-2 right-2 text-red-500 hover:bg-red-100 p-2 rounded"
              >
                <TrashIcon size={20} />
              </button>
              {renderQuestionComponent(question, index)}
            </div>
          ))}

          {showQuestionTypeSelector ? (
            <QuestionTypeSelector
              onSelect={handleAddQuestion}
              onClose={() => setShowQuestionTypeSelector(false)}
            />
          ) : (
            <button
              onClick={() => setShowQuestionTypeSelector(true)}
              className="w-full border-2 border-dashed border-gray-300 p-4 text-center hover:bg-gray-100 transition"
            >
              <PlusIcon className="mx-auto mb-2" />
              Add Question
            </button>
          )}
        </div>

        {/* Save Form Button */}
        <div className="mt-6">
          <button
            onClick={handleSaveForm}
            disabled={isLoading}
            className={`w-full p-3 rounded transition ${
              isLoading
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <LoaderIcon className="mr-2 animate-spin" />
                Saving...
              </div>
            ) : (
              "Save Form"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FormEditor;
