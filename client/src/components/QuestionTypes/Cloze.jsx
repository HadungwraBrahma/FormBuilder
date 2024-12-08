import { useState, useRef, useEffect } from "react";
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
import { GripVerticalIcon, TrashIcon, PlusIcon, ImageIcon } from "lucide-react";
import { useForm } from "../../context/FormContext";

const DraggableItem = ({ id, children }) => {
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
      className="flex items-center p-2 bg-blue-100 rounded mb-2"
    >
      <GripVerticalIcon size={16} className="mr-2 text-gray-500" />
      <span className="flex-grow">{children}</span>
    </div>
  );
};

const Cloze = ({ onResponseChange, index, question }) => {
  const { updateFormQuestion } = useForm();
  const [sentence, setSentence] = useState(question.content.sentence || "");
  const [options, setOptions] = useState([]);
  const [newOption, setNewOption] = useState("");
  const [questionImage, setQuestionImage] = useState(null);
  const [questionImageUrl, setQuestionImageUrl] = useState(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    const blankOptions = options.filter((opt) => opt.type === "blank");

    let modifiedSentence = sentence;
    let blankParts = [];
    let offset = 0;

    const sortedBlanks = blankOptions.sort(
      (a, b) => a.selectionStart - b.selectionStart
    );

    sortedBlanks.forEach((blank) => {
      const adjustedStart = blank.selectionStart + offset;
      const adjustedEnd = blank.selectionEnd + offset;

      modifiedSentence =
        modifiedSentence.slice(0, adjustedStart) +
        "[BLANK]" +
        modifiedSentence.slice(adjustedEnd);

      blankParts.push(blank.text);

      offset += "[BLANK]".length - (adjustedEnd - adjustedStart);
    });

    const optionTexts = options.map((opt) => opt.text);

    const questionContent = {
      type: "Cloze",
      content: {
        title: question.content.title,
        image: questionImage || undefined,
        sentence: modifiedSentence,
        blanks: blankParts,
        options: optionTexts,
      },
    };

    if (onResponseChange) {
      onResponseChange(index, questionContent);
    }
    updateFormQuestion(index, questionContent);
  }, [sentence, options, questionImage]);

  const handleQuestionImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setQuestionImage(file);
      setQuestionImageUrl(imageUrl);
    }
  };

  const handleTextSelection = () => {
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end).trim();

    if (selectedText && /\w+/.test(selectedText)) {
      const existingBlank = options.find(
        (opt) =>
          opt.type === "blank" &&
          opt.text === selectedText &&
          opt.selectionStart === start
      );

      if (!existingBlank) {
        const newBlank = {
          id: `blank_${Date.now()}`,
          text: selectedText,
          type: "blank",
          selectionStart: start,
          selectionEnd: end,
        };

        setOptions((prevOptions) => [...prevOptions, newBlank]);
      }
    }
  };

  const renderSentenceWithBlanks = () => {
    const blankOptions = options.filter((opt) => opt.type === "blank");

    let modifiedSentence = sentence;
    let offset = 0;

    const sortedBlanks = blankOptions.sort(
      (a, b) => a.selectionStart - b.selectionStart
    );

    sortedBlanks.forEach((blank) => {
      const adjustedStart = blank.selectionStart + offset;
      const adjustedEnd = blank.selectionEnd + offset;

      const replacement = `_____`;
      modifiedSentence =
        modifiedSentence.slice(0, adjustedStart) +
        replacement +
        modifiedSentence.slice(adjustedEnd);

      offset += replacement.length - (adjustedEnd - adjustedStart);
    });

    return <div className="mb-4 p-2 border rounded">{modifiedSentence}</div>;
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
    <div className="p-4 bg-white rounded-lg shadow-md">
    <h3 className="text-lg font-semibold mb-4">{question.content.title}</h3>

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
          ref={textareaRef}
          value={sentence}
          onChange={(e) => setSentence(e.target.value)}
          onMouseUp={handleTextSelection}
          placeholder="Type your sentence here. Select text to create blanks."
          className="w-full p-2 border rounded min-h-[100px] cursor-text"
        />
      </div>

      {/* Draggable Options */}
      <DndContext
        collisionDetection={closestCorners}
        onDragEnd={handleDragEnd}
        sensors={sensors}
      >
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