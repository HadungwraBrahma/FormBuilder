import { useState, useRef, useEffect } from "react";
import { DndContext, closestCorners } from "@dnd-kit/core";
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVerticalIcon, TrashIcon, PlusIcon, ImageIcon } from "lucide-react";
import { useForm } from "../../context/FormContext";

const DraggableItem = ({ id, children }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: "grab",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="flex items-center p-2 bg-blue-100 rounded mb-2"
    >
      <GripVerticalIcon size={16} className="mr-2 text-gray-500" />
      <span className="flex-grow">{children}</span>
    </div>
  );
};

const Cloze = ({ onResponseChange, index, question }) => {
  const { updateFormQuestion } = useForm();
  const [title, setTitle] = useState(
    question.content.title || "Fill in the Blanks"
  );
  const [description, setDescription] = useState(
    question.content.description ||
      "Complete the sentence by dragging the correct words"
  );
  const [sentence, setSentence] = useState(question.content.sentence || "");

  const [options, setOptions] = useState(() => {
    const initialBlanks =
      question.content.blanks?.map((blank, i) => ({
        id: `blank_${i}`,
        text: blank,
        type: "blank",
      })) || [];

    const initialCustomOptions =
      question.content.options
        ?.filter((opt) => !initialBlanks.some((blank) => blank.text === opt))
        .map((opt, i) => ({
          id: `option_${i}`,
          text: opt,
          type: "custom",
        })) || [];

    return [...initialBlanks, ...initialCustomOptions];
  });

  const [newOption, setNewOption] = useState("");
  const [questionImage, setQuestionImage] = useState(
    question.content.image ? question.content.image : null
  );
  const [questionImageUrl, setQuestionImageUrl] = useState(
    question.content.image ? URL.createObjectURL(question.content.image) : null
  );
  const textRef = useRef(null);

  useEffect(() => {
    let modifiedSentence = sentence;
    const blankPlaceholders = options
      .filter((opt) => opt.type === "blank")
      .map(() => "[BLANK]");

    options
      .filter((opt) => opt.type === "blank")
      .forEach((blank, index) => {
        modifiedSentence = modifiedSentence.replace(
          blank.text,
          blankPlaceholders[index]
        );
      });

    const optionTexts = options.map((opt) => opt.text);

    const questionContent = {
      type: "Cloze",
      content: {
        title,
        description,
        image: questionImage || undefined,
        sentence: modifiedSentence,
        blanks: blankPlaceholders,
        options: optionTexts,
      },
    };

    if (onResponseChange) {
      onResponseChange(index, questionContent);
    }
    updateFormQuestion(index, questionContent);
  }, [title, description, sentence, options, questionImage]);

  const handleQuestionImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setQuestionImage(file);
      setQuestionImageUrl(imageUrl);
    }
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();

    if (selectedText && !options.some((opt) => opt.text === selectedText)) {
      const newBlank = {
        id: `blank_${Date.now()}`,
        text: selectedText,
        type: "blank",
      };
      setOptions([...options, newBlank]);
    }
  };

  const renderSentenceWithBlanks = () => {
    let modifiedSentence = sentence;
    options
      .filter((opt) => opt.type === "blank")
      .forEach((blank) => {
        modifiedSentence = modifiedSentence.replace(
          blank.text,
          `<span class="bg-yellow-200 px-2 py-1 rounded">${"_____"}</span>`
        );
      });

    return (
      <div
        ref={textRef}
        dangerouslySetInnerHTML={{ __html: modifiedSentence }}
        className="mb-4 p-2 border rounded"
      />
    );
  };

  const handleRemoveOption = (optionToRemove) => {
    const updatedOptions = options.filter(
      (option) => option.id !== optionToRemove.id
    );
    setOptions(updatedOptions);
  };

  const handleAddCustomOption = () => {
    if (newOption.trim()) {
      const newOptionObj = {
        id: `option_${Date.now()}`,
        text: newOption.trim(),
        type: "custom",
      };
      setOptions([...options, newOptionObj]);
      setNewOption("");
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = options.findIndex((item) => item.id === active.id);
      const newIndex = options.findIndex((item) => item.id === over.id);

      const updatedOptions = arrayMove(options, oldIndex, newIndex);
      setOptions(updatedOptions);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Create Cloze Test</h2>

      {/* Title and Description */}
      <div className="mb-4">
        <label className="block mb-2 font-semibold">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter question title"
          className="w-full p-2 border rounded"
        />
      </div>
      <div className="mb-4">
        <label className="block mb-2 font-semibold">Description</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter question description"
          className="w-full p-2 border rounded"
        />
      </div>

      {/* Image Upload */}
      <div className="relative mb-4">
        <div className="absolute top-2 right-2">
          <input
            type="file"
            accept="image/*"
            id={`question-image-upload-${index}`}
            onChange={handleQuestionImageUpload}
            className="hidden"
          />
          <label
            htmlFor={`question-image-upload-${index}`}
            className="cursor-pointer rounded"
          >
            <ImageIcon
              size={20}
              className="text-gray-500 hover:text-blue-500"
            />
          </label>
        </div>
        {questionImageUrl && (
          <img
            src={questionImageUrl}
            alt="Question"
            className="mb-4 max-h-48 w-full object-scale-down rounded"
          />
        )}
      </div>

      {/* Preview */}
      <div className="mb-4">
        <h3 className="font-bold mb-2">Preview</h3>
        {renderSentenceWithBlanks()}
      </div>

      {/* Sentence Input */}
      <div className="mb-4">
        <label className="block mb-2 font-semibold">Sentence</label>
        <textarea
          value={sentence}
          onChange={(e) => setSentence(e.target.value)}
          onMouseUp={handleTextSelection}
          placeholder="Type your sentence here. Select text to create blanks."
          className="w-full p-2 border rounded min-h-[100px] cursor-text"
        />
      </div>

      {/* Draggable Options */}
      <DndContext collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 gap-4">
          {/* Options */}
          <div>
            <div className="flex items-center mb-2">
              <h4 className="font-bold flex-grow">Options</h4>
              <button
                onClick={handleAddCustomOption}
                disabled={!newOption.trim()}
                className="text-green-500 disabled:text-gray-300"
              >
                <PlusIcon size={20} />
              </button>
            </div>
            <div className="flex mb-2">
              <input
                type="text"
                value={newOption}
                onChange={(e) => setNewOption(e.target.value)}
                placeholder="Add custom option"
                className="flex-grow border rounded p-1 mr-2"
              />
            </div>
            <SortableContext
              items={options.map((option) => option.id)}
              strategy={rectSortingStrategy}
            >
              {options.map((option) => (
                <div key={option.id} className="flex items-center mb-2">
                  <DraggableItem id={option.id}>
                    {option.text}
                    {option.type === "blank" && (
                      <span className="ml-2 text-xs text-blue-500">
                        (Blank)
                      </span>
                    )}
                    {option.type === "custom" && (
                      <span className="ml-2 text-xs text-green-500">
                        (Custom)
                      </span>
                    )}
                  </DraggableItem>
                  <button
                    onClick={() => handleRemoveOption(option)}
                    className="ml-2 text-red-500 hover:bg-red-100 rounded p-1"
                  >
                    <TrashIcon size={16} />
                  </button>
                </div>
              ))}
            </SortableContext>
          </div>
        </div>
      </DndContext>
    </div>
  );
};

export default Cloze;
