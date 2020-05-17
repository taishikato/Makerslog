import React, { useState, useEffect, useContext } from 'react';
import { ITodoNew } from '../interfaces/ITodo';
import extractTag from '../plugins/extractTag';
import { FirestoreContext } from './FirestoreContextProvider';
import { Link } from 'react-router-dom';
import ReactHashtag from 'react-hashtag';
import CommentAddForm from './CommentAddForm';
import CommentAddButton from './CommentAddButton';

const TodoForShow: React.FC<IProps> = ({ todo }) => {
  const db = useContext(FirestoreContext);
  let text = todo.text;
  const tag = extractTag(text);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [commentCount, setCommentCount] = useState(0);

  const handleAddCommentButtonClick = () => setShowCommentForm(!showCommentForm);

  useEffect(() => {
    const getComments = async () => {
      const todoSnapShot = await db.collection('comments').where('todoId', '==', todo.id).get();
      setCommentCount(todoSnapShot.size);
    };
    getComments();
  }, [db, todo, setCommentCount]);

  return (
    <div>
      <div className="flex items-center">
        <label className="inline-flex items-center">
          <input
            type="checkbox"
            className="form-checkbox h-6 w-6 text-green-500 cursor-not-allowed"
            checked={todo.checked}
            disabled
          />
          {tag !== null ? (
            <span className="ml-3 text-lg">
              <ReactHashtag
                renderHashtag={(hashtagValue: string) => (
                  <Link
                    to={`/project/${hashtagValue.slice(1)}`}
                    className="bg-blue-200 p-1 ml-3 rounded text-blue-700 text-lg">
                    {hashtagValue}
                  </Link>
                )}>
                {text}
              </ReactHashtag>
            </span>
          ) : (
            <span className="ml-3 text-lg">{text}</span>
          )}
        </label>
      </div>
      <div className="mt-1">
        <CommentAddButton commentCount={commentCount} handleAddCommentButtonClick={handleAddCommentButtonClick} />
      </div>
      <div className="ml-8">
        <CommentAddForm show={showCommentForm} todo={todo} />
      </div>
    </div>
  );
};

export default TodoForShow;

interface IProps {
  todo: ITodoNew;
}
