import React, { useState, useEffect, useContext } from 'react';
import moment from 'moment-timezone';
import { useDispatch } from 'react-redux';
import { ITodoNew } from '../interfaces/ITodo';
import { FirestoreContext } from './FirestoreContextProvider';
import EditButton from './EditButton';
import { editMyTodo } from '../store/action';
import CommentAddForm from './CommentAddForm';
import CommentAddButton from './CommentAddButton';
import ProjectItem from './ProjectItem';

const Todo: React.FC<IProps> = ({ todo }) => {
  const db = useContext(FirestoreContext);
  const dispatch = useDispatch();
  const [todoState, setTodoState] = useState(todo);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [commentCount, setCommentCount] = useState(0);

  const handleAddCommentButtonClick = () => setShowCommentForm(!showCommentForm);

  const handleChangeTodoStatus = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    const today = moment().tz('Asia/Tokyo').format('YYYYMMDD');
    await db.collection('todos').doc(todo.id).update({ checked, doneDate: today });
    const copiedTodo = { ...todo };
    copiedTodo.checked = checked;
    setTodoState(copiedTodo);
    dispatch(editMyTodo(copiedTodo as any));
    return;
  };
  useEffect(() => {
    setTodoState(todo);
  }, [todo]);

  useEffect(() => {
    const getComments = async () => {
      const todoSnapShot = await db.collection('comments').where('todoId', '==', todo.id).get();
      setCommentCount(todoSnapShot.size);
    };
    getComments();
  }, [db, todo, setCommentCount]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <label className="inline-flex items-center">
          <input
            type="checkbox"
            className="form-checkbox h-5 w-5 text-green-500"
            onChange={e => handleChangeTodoStatus(e)}
            checked={todoState.checked}
          />
          <span className="ml-3 text-sm">{todoState.text}</span>
        </label>
      </div>
      <div className="mt-1 flex flex-wrap items-center">
        <CommentAddButton commentCount={commentCount} handleAddCommentButtonClick={handleAddCommentButtonClick} />
        <EditButton todo={todoState} />
        {todoState.tag !== '' && todoState.tag !== null && <ProjectItem tag={todoState.tag as string} />}
      </div>
      <div className="ml-8">
        <CommentAddForm show={showCommentForm} todo={todo} />
      </div>
    </div>
  );
};

export default Todo;

interface IProps {
  todo: ITodoNew;
}
