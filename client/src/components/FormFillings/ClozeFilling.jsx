import { useState, useEffect } from "react";
import { DndContext, useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import DroppableBlank from "../DndCommons/DroppableBlank.jsx";

const DraggableItem = ({ content, uniqueKey }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: uniqueKey,
    });

  const style = {
    transform: CSS.Translate.toString(transform),
    cursor: "grab",
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="px-3 py-1 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors"
    >
      {content}
    </div>
  );
};

const ClozeFilling = ({ question, response, onResponseUpdate }) => {
  const paragraphParts =
    (question.content.sentence || "").split(/(\[BLANK\])/) || [];
  const blankCount = paragraphParts.filter((part) => part === "[BLANK]").length;

  const createUniqueOptions = () => {
    return (question.content.options || []).map((option, index) => ({
      content: option,
      uniqueKey: `option_${option}_${index}`,
    }));
  };

  const [uniqueOptions, setUniqueOptions] = useState(createUniqueOptions());

  const calculateUnusedOptions = () =>
    uniqueOptions.filter(
      (option) => !(response || []).includes(option.uniqueKey)
    );

  const [unusedOptions, setUnusedOptions] = useState(calculateUnusedOptions());

  useEffect(() => {
    setUniqueOptions(createUniqueOptions());
    setUnusedOptions(calculateUnusedOptions());
  }, [question, response]);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!active || !over) return;

    const selectedOptionKey = active.id.toString();
    const blankIndex = parseInt(over.id.toString().split("_")[1], 10);
    const currentResponse = response || new Array(blankCount).fill(null);

    const updatedResponse = currentResponse.map((item, index) =>
      index === blankIndex ? selectedOptionKey : item
    );

    onResponseUpdate(updatedResponse);
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">{question.content.title}</h2>

        {question.content.imageUrl && (
          <div className="mb-4">
            <img
              src={question.content.imageUrl}
              alt="Cloze Question Illustration"
              className="w-full h-48 object-scale-down rounded-lg mb-4"
            />
          </div>
        )}

        <div className="mb-4 text-lg">
          {paragraphParts.map((part, index) => {
            const blankIndex =
              paragraphParts.slice(0, index + 1).filter((p) => p === "[BLANK]")
                .length - 1;

            return part === "[BLANK]" ? (
              <DroppableBlank
                key={`blank_${blankIndex}`}
                id={`blank_${blankIndex}`}
                filledWith={
                  response?.[blankIndex]
                    ? uniqueOptions.find(
                        (opt) => opt.uniqueKey === response[blankIndex]
                      )?.content
                    : null
                }
                options={question.content.options || []}
              />
            ) : (
              <span key={`text_${index}`}>{part}</span>
            );
          })}
        </div>

        <div className="flex space-x-2 mt-4">
          {unusedOptions.map((option) => (
            <DraggableItem
              key={option.uniqueKey}
              id={option.content}
              content={option.content}
              uniqueKey={option.uniqueKey}
            />
          ))}
        </div>
      </div>
    </DndContext>
  );
};

export default ClozeFilling;
