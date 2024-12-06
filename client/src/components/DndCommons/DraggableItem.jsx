import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

const DraggableItem = ({ id, content }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: id,
    data: {
      text: content
    }
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    cursor: 'move',
    opacity: isDragging ? 0.5 : 1
  };

  return (
    <div 
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      className="px-4 py-2 bg-blue-100 rounded"
    >
      {content}
    </div>
  );
};

export default DraggableItem;