import React from 'react';

const CommentAddButton: React.FC<IProps> = ({ handleAddCommentButtonClick, commentCount }) => {
  return (
    <button
      onClick={handleAddCommentButtonClick}
      className="rounded-full text-xs ml-8 py-1 px-2 focus:outline-none hover:bg-gray-200">
      <span role="img" aria-label="emoji">
        💬
      </span>
      <span className="ml-1">{commentCount > 0 && commentCount}</span>
    </button>
  );
};

export default CommentAddButton;

interface IProps {
  handleAddCommentButtonClick: () => void;
  commentCount: number;
}
