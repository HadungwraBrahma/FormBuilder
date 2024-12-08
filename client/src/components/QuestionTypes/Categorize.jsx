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
import { PlusIcon, TrashIcon, GripVerticalIcon, ImageIcon } from "lucide-react";

const DraggableItem = ({ id, children, type = "item" }) => {
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
      className={`flex items-center p-2 ${
        type === "category" ? "bg-gray-100" : "bg-blue-100"
      } rounded mb-2`}
    >
      <GripVerticalIcon size={16} className="mr-2 text-gray-500" />
      <span className="flex-grow">{children}</span>
    </div>
  );
};

const Categorize = ({ question, onResponseChange, index }) => {
  const [questionImage, setQuestionImage] = useState(
    question.content.image ? question.content.image : null
  );
  const [questionImageUrl, setQuestionImageUrl] = useState(null);
  const [categories, setCategories] = useState(
    question.content.categories || []
  );
  const [newCategory, setNewCategory] = useState("");
  const [selectedCategories, setSelectedCategories] = useState({});
  const [items, setItems] = useState(question.content?.items || []);
  const [newItem, setNewItem] = useState("");

  const [questionDescription, setQuestionDescription] = useState(
    question.content.description || ""
  );

  const handleQuestionImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setQuestionImage(file);
      setQuestionImageUrl(imageUrl);
    }
  };

  useEffect(() => {
    const categorizedData = {
      type: "Categorize",
      content: {
        title: question.content.title,
        description: questionDescription,
        image: questionImage,
        categories: categories,
        items: items.map((item) => ({
          ...item,
          category: selectedCategories[item.id] || "",
        })),
      },
    };

    if (onResponseChange) {
      onResponseChange(index, categorizedData);
    }
  }, [
    categories,
    items,
    selectedCategories,
    questionDescription,
    questionImage,
  ]);

  const handleDragEndCategories = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setCategories((categories) => {
        const oldIndex = categories.findIndex((cat) => cat === active.id);
        const newIndex = categories.findIndex((cat) => cat === over.id);

        return arrayMove(categories, oldIndex, newIndex);
      });
    }
  };

  const handleDragEndItems = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleCategorySelect = (itemId, category) => {
    setSelectedCategories((prev) => ({
      ...prev,
      [itemId]: category,
    }));
  };

  const handleAddCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      setCategories([...categories, newCategory.trim()]);
      setNewCategory("");
    }
  };

  const handleRemoveCategory = (categoryToRemove) => {
    const updatedCategories = categories.filter(
      (cat) => cat !== categoryToRemove
    );
    setCategories(updatedCategories);

    const updatedSelectedCategories = { ...selectedCategories };
    Object.keys(updatedSelectedCategories).forEach((itemId) => {
      if (updatedSelectedCategories[itemId] === categoryToRemove) {
        delete updatedSelectedCategories[itemId];
      }
    });
    setSelectedCategories(updatedSelectedCategories);
  };

  const handleAddItem = () => {
    if (newItem.trim()) {
      const newItemId = `item${Date.now()}`;
      const newItemObject = {
        id: newItemId,
        text: newItem.trim(),
      };
      setItems([...items, newItemObject]);
      setNewItem("");
    }
  };

  const handleRemoveItem = (itemToRemove) => {
    const updatedItems = items.filter((item) => item.id !== itemToRemove.id);
    setItems(updatedItems);

    const updatedSelectedCategories = { ...selectedCategories };
    delete updatedSelectedCategories[itemToRemove.id];
    setSelectedCategories(updatedSelectedCategories);
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

      {/* Question Description & Image Upload */}
      <div className="relative mb-4">
        <textarea
          value={questionDescription}
          onChange={(e) => setQuestionDescription(e.target.value)}
          placeholder="Enter question description (optional)"
          className="w-full border rounded p-2 pr-10"
        />
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
            className="mt-2 max-h-48 object-cover rounded"
          />
        )}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {/* Categories section */}
        <div>
          <div className="flex items-center mb-2">
            <h4 className="font-bold flex-grow">Categories</h4>
            <button
              onClick={handleAddCategory}
              disabled={!newCategory.trim()}
              className="text-green-500 disabled:text-gray-300"
            >
              <PlusIcon size={20} />
            </button>
          </div>
          <div className="flex mb-2">
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="New Category"
              className="flex-grow border rounded p-1 mr-2"
            />
          </div>
          <DndContext
            collisionDetection={closestCorners}
            onDragEnd={handleDragEndCategories}
            sensors={sensors}
          >
            <SortableContext items={categories} strategy={rectSortingStrategy}>
              {categories.map((category) => (
                <div key={category} className="flex items-center mb-2">
                  <DraggableItem id={category} type="category">
                    {category}
                  </DraggableItem>
                  <button
                    onClick={() => handleRemoveCategory(category)}
                    className="ml-2 text-red-500 hover:bg-red-100 rounded p-1"
                  >
                    <TrashIcon size={16} />
                  </button>
                </div>
              ))}
            </SortableContext>
          </DndContext>
        </div>

        {/* Draggable Items */}
        <div>
          <div className="flex items-center mb-2">
            <h4 className="font-bold flex-grow">Items</h4>
            <button
              onClick={handleAddItem}
              disabled={!newItem.trim()}
              className="text-green-500 disabled:text-gray-300"
            >
              <PlusIcon size={20} />
            </button>
          </div>
          <div className="flex mb-2">
            <input
              type="text"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              placeholder="New Item"
              className="flex-grow border rounded p-1 mr-2"
            />
          </div>
          <DndContext
            collisionDetection={closestCorners}
            onDragEnd={handleDragEndItems}
          >
            <SortableContext
              items={items.map((item) => item.id)}
              strategy={rectSortingStrategy}
            >
              <h1>Item &emsp; &emsp; &emsp;Belong to</h1>
              {items.map((item) => (
                <div key={item.id} className="flex items-center mb-2 space-x-2">
                  <DraggableItem id={item.id}>{item.text}</DraggableItem>
                  <select
                    value={selectedCategories[item.id] || ""}
                    onChange={(e) =>
                      handleCategorySelect(item.id, e.target.value)
                    }
                    className="p-1 border rounded flex-grow"
                  >
                    <option value="">Select Category</option>
                    {categories.map((category, index) => (
                      <option key={index} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleRemoveItem(item)}
                    className="text-red-500 hover:bg-red-100 rounded p-1"
                  >
                    <TrashIcon size={16} />
                  </button>
                </div>
              ))}
            </SortableContext>
          </DndContext>
        </div>
      </div>
    </div>
  );
};

export default Categorize;
