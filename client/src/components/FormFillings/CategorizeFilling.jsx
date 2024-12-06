import { useState, useEffect } from "react";
import { DndContext } from "@dnd-kit/core";
import DraggableItem from "../Dndcommons/DraggableItem";
import DroppableCategory from "../Dndcommons/DroppableCategory";

const CategorizeFilling = ({ question, response, onResponseUpdate }) => {
  const calculateUnassignedItems = () =>
    (question.content.items || []).filter(
      (item) =>
        !Object.values(response || {}).some((categoryItems) =>
          categoryItems.includes(item.id.toString())
        )
    );

  const [unassignedItems, setUnassignedItems] = useState(
    calculateUnassignedItems()
  );

  useEffect(() => {
    setUnassignedItems(calculateUnassignedItems());
  }, [response, question]);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!active || !over) return;

    const itemId = active.id.toString();
    const categoryName = over.id.toString();
    const currentResponse = response || {};

    const cleanedResponse = Object.keys(currentResponse).reduce((acc, cat) => {
      acc[cat] = (currentResponse[cat] || []).filter((id) => id !== itemId);
      return acc;
    }, {});

    const updatedResponse = {
      ...cleanedResponse,
      [categoryName]: [...(cleanedResponse[categoryName] || []), itemId],
    };

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
              alt="Categorize Question Illustration"
              className="w-full h-48 object-scale-down rounded-lg mb-4"
            />
          </div>
        )}

        <div className="mb-4">
          <h3 className="font-medium mb-2">Drag Items to Categories</h3>
          <div className="flex space-x-2">
            {unassignedItems.map((item) => (
              <DraggableItem
                key={item.id}
                id={item.id.toString()}
                content={item.text}
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {question.content.categories?.map((category) => (
            <div key={category} className="border p-4 rounded">
              <h3 className="font-medium mb-2">{category}</h3>
              <DroppableCategory
                id={category}
                items={question.content.items.filter((item) =>
                  (response?.[category] || []).includes(item.id.toString())
                )}
              />
            </div>
          ))}
        </div>
      </div>
    </DndContext>
  );
};

export default CategorizeFilling;
