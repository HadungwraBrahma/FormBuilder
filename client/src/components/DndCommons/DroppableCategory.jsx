import { useDroppable } from '@dnd-kit/core';

const DroppableCategory = ({ id, items }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: id
  });

  return (
    <div 
      ref={setNodeRef}
      className={`min-h-[100px] border-2 ${isOver ? 'border-green-500' : 'border-dashed'} p-2`}
    >
      {items?.map(item => (
        <div 
          key={item.id} 
          className="px-4 py-2 bg-blue-100 rounded m-1"
        >
          {item.text}
        </div>
      ))}
    </div>
  );
};

export default DroppableCategory;