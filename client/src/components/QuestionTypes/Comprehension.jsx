import { useState, useEffect } from "react";
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  closestCorners,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TrashIcon, GripVerticalIcon, ImageIcon } from "lucide-react";
import { useForm } from "../../context/FormContext";

const DraggableItem = ({ id, children, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition, active } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: active ? "grabbing" : "grab",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="flex items-center bg-blue-100 p-2 rounded mb-2"
    >
      <div className="flex-grow flex items-center">
        <GripVerticalIcon size={16} className="mr-2 text-gray-500" />
        {children}
      </div>
      <button onClick={() => onDelete(id)} className="text-red-500 ml-2">
        <TrashIcon size={16} />
      </button>
    </div>
  );
};

const DynamicComprehension = ({ onResponseChange, index, question }) => {
  const { updateFormQuestion } = useForm();
  const [passage, setPassage] = useState(question?.content?.passage || "");
  const [questions, setQuestions] = useState(
    question?.content?.questions?.map((q, i) => ({
      id: `q${i}`,
      question: q.question,
      options: q.options,
    })) || []
  );
  const [newQuestion, setNewQuestion] = useState("");
  const [newOptions, setNewOptions] = useState(["", ""]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [passageImage, setPassageImage] = useState(
    question?.content?.image ? question.content.image : null
  );
  const [passageImageUrl, setPassageImageUrl] = useState(
    question?.content?.image
      ? URL.createObjectURL(question.content.image)
      : null
  );

  const [title, setTitle] = useState(
    question?.content?.title || "Reading Comprehension"
  );
  const [description, setDescription] = useState(
    question?.content?.description ||
      "Read the passage and answer the questions"
  );

  useEffect(() => {
    const comprehensionContent = {
      type: "Comprehension",
      content: {
        title,
        description,
        passage,
        image: passageImage || undefined,
        questions: questions.map((q) => ({
          question: q.question,
          options: q.options,
        })),
      },
    };

    if (onResponseChange) {
      onResponseChange(index, comprehensionContent);
    }
    updateFormQuestion(index, comprehensionContent);
  }, [passage, questions, passageImage, title, description]);

  const handlePassageImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setPassageImage(file);
      setPassageImageUrl(imageUrl);
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setQuestions((questions) => {
        const oldIndex = questions.findIndex((q) => q.id === active.id);
        const newIndex = questions.findIndex((q) => q.id === over.id);

        return arrayMove(questions, oldIndex, newIndex);
      });
    }
  };

  const addQuestion = () => {
    if (newQuestion.trim() && newOptions.every((opt) => opt.trim())) {
      const newQuestionObj = {
        id: `q${Date.now()}`,
        question: newQuestion.trim(),
        options: newOptions.map((opt) => opt.trim()),
      };

      setQuestions((prevQuestions) => [...prevQuestions, newQuestionObj]);
      setNewQuestion("");
      setNewOptions(["", ""]);
    }
  };

  const addOptionField = () => {
    setNewOptions((prevOptions) => [...prevOptions, ""]);
  };

  const updateOption = (index, value) => {
    setNewOptions((prevOptions) => {
      const updatedOptions = [...prevOptions];
      updatedOptions[index] = value;
      return updatedOptions;
    });
  };

  const removeOption = (indexToRemove) => {
    if (newOptions.length > 2) {
      setNewOptions((prevOptions) =>
        prevOptions.filter((_, index) => index !== indexToRemove)
      );
    }
  };

  const removeQuestion = (questionId) => {
    setQuestions((prevQuestions) =>
      prevQuestions.filter((q) => q.id !== questionId)
    );
  };

  const handleAnswerSelect = (questionId, answer) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 1,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        distance: 1,
      },
    })
  );

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Create Comprehension Passage</h2>

      {/* Title and Description */}
      <div className="mb-4">
        <label className="block mb-2 font-semibold">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter comprehension title"
          className="w-full p-2 border rounded"
        />
      </div>
      <div className="mb-4">
        <label className="block mb-2 font-semibold">Description</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter comprehension description"
          className="w-full p-2 border rounded"
        />
      </div>

      {/* Image Upload */}
      <div className="relative mb-6">
        <div className="absolute top-2 right-2">
          <input
            type="file"
            accept="image/*"
            id={`passage-image-upload-${index}`}
            onChange={handlePassageImageUpload}
            className="hidden"
          />
          <label
            htmlFor={`passage-image-upload-${index}`}
            className="cursor-pointer rounded"
          >
            <ImageIcon
              size={20}
              className="text-gray-500 hover:text-blue-500"
            />
          </label>
        </div>
        {passageImageUrl && (
          <img
            src={passageImageUrl}
            alt="Passage"
            className="mb-4 max-h-48 w-full object-scale-down rounded"
          />
        )}
      </div>

      <div className="mb-6">
        <textarea
          value={passage}
          onChange={(e) => setPassage(e.target.value)}
          placeholder="Enter your comprehension passage"
          className="w-full p-2 border rounded-md min-h-[150px]"
        />
      </div>

      {/* Question Creation Section */}
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Add Questions</h3>
        <input
          type="text"
          value={newQuestion}
          onChange={(e) => setNewQuestion(e.target.value)}
          placeholder="Enter question"
          className="w-full p-2 border rounded-md mb-2"
        />

        {newOptions.map((option, index) => (
          <div key={index} className="flex mb-2">
            <input
              type="text"
              value={option}
              onChange={(e) => updateOption(index, e.target.value)}
              placeholder={`Option ${index + 1}`}
              className="w-full p-2 border rounded-md mr-2"
            />
            {newOptions.length > 2 && (
              <button
                onClick={() => removeOption(index)}
                className="bg-red-100 p-2 rounded"
              >
                <TrashIcon size={16} />
              </button>
            )}
          </div>
        ))}

        <div className="flex space-x-2 mb-4">
          <button onClick={addOptionField} className="bg-blue-100 p-2 rounded">
            Add Option
          </button>
          <button
            onClick={addQuestion}
            disabled={
              !newQuestion.trim() || newOptions.some((opt) => !opt.trim())
            }
            className="bg-green-500 text-white p-2 rounded disabled:opacity-50"
          >
            Add Question
          </button>
        </div>
      </div>

      <DndContext
        collisionDetection={closestCorners}
        onDragEnd={handleDragEnd}
        sensors={sensors}
      >
        <SortableContext
          items={questions.map((q) => q.id)}
          strategy={rectSortingStrategy}
        >
          {questions.map((q) => (
            <DraggableItem key={q.id} id={q.id} onDelete={removeQuestion}>
              <div className="w-full">
                <p className="font-medium">{q.question}</p>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {q.options.map((option, optionIndex) => (
                    <button
                      key={optionIndex}
                      onClick={() => handleAnswerSelect(q.id, option)}
                      className={`
                        p-2 rounded-md text-left transition-colors duration-200
                        ${
                          selectedAnswers[q.id] === option
                            ? "bg-blue-500 text-white"
                            : "bg-white border border-gray-300 hover:bg-gray-100"
                        }
                      `}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </DraggableItem>
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default DynamicComprehension;
