import { useDroppable } from '@dnd-kit/core';

const DroppableBlank = ({ id, filledWith, options }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: id
  });

  const getItemText = () => {
    if (!filledWith) return '';
    const matchedOption = options.find(option => option === filledWith);
    return matchedOption || '';
  };

  return (
    <span 
      ref={setNodeRef}
      className={`inline-block w-24 h-8 ${isOver ? 'border-green-500' : 'border-blue-500'} border-b-2 mx-2 text-center`}
    >
      {getItemText()}
    </span>
  );
};

export default DroppableBlank;