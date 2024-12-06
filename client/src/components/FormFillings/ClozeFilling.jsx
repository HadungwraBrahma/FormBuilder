import { useState, useEffect } from "react";
import { DndContext } from "@dnd-kit/core";
import DraggableItem from "../DndCommons/DraggableItem.jsx";
import DroppableBlank from "../DndCommons/DroppableBlank.jsx";

const ClozeFilling = ({ question, response, onResponseUpdate }) => {
  const paragraphParts =
    (question.content.sentence || "").split(/(\[BLANK\])/) || [];
  const blankCount = paragraphParts.filter((part) => part === "[BLANK]").length;

  const calculateUnusedOptions = () =>
    (question.content.options || []).filter(
      (option) => !(response || []).includes(option)
    );

  const [unusedOptions, setUnusedOptions] = useState(calculateUnusedOptions());

  useEffect(() => {
    setUnusedOptions(calculateUnusedOptions());
  }, [response, question]);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!active || !over) return;

    const optionId = active.id.toString();
    const blankIndex = parseInt(over.id.toString().split("_")[1], 10);
    const currentResponse = response || new Array(blankCount).fill(null);

    const updatedResponse = currentResponse.map((item, index) =>
      index === blankIndex ? optionId : item
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
                filledWith={response?.[blankIndex]}
                options={question.content.options || []}
              />
            ) : (
              <span key={`text_${index}`}>{part}</span>
            );
          })}
        </div>

        <div className="flex space-x-2 mt-4">
          {unusedOptions.map((option) => (
            <DraggableItem key={option} id={option} content={option} />
          ))}
        </div>
      </div>
    </DndContext>
  );
};

export default ClozeFilling;
