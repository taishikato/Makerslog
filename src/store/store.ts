import { createStore, combineReducers } from 'redux';
import {
  LOGIN,
  LOGOUT,
  DONE_CHECKING,
  ADD_TODOS,
  SET_TODOS,
  REMOVE_TODOS,
  EDIT_TODOS,
  SET_TIMELINE,
  ADD_TIMELINE,
} from './action';
import IInitialState from '../interfaces/IInitialState';
import { defaultTodo } from '../interfaces/ITodo';
import { defaultUser } from '../interfaces/ILoginUser';
import { ITodoData } from '../interfaces/ITodoData';

export const initialState: IInitialState = {
  timeline: [] as any,
  loadMoreCount: 3,
  loginUser: defaultUser,
  isLogin: false,
  isCheckingLogin: true,
  myTodos: [defaultTodo],
};

const timeline = (state = [], action: any) => {
  switch (action.type) {
    case SET_TIMELINE:
      return [...action.timeline];
    case ADD_TIMELINE:
      return [...state, action.todoData];
    default:
      return state;
  }
};

const loadMoreCount = (state = 3, action: any) => {
  switch (action.type) {
    case ADD_TIMELINE:
      let CopiedState = state;
      return (CopiedState += 1);
    default:
      return state;
  }
};

const myTodos = (state = [defaultTodo], action: any) => {
  switch (action.type) {
    case SET_TODOS:
      return [...action.todos];
    case ADD_TODOS:
      return [
        ...state,
        {
          id: action.id,
          text: action.text,
          created: action.created,
          createdDate: action.createdDate,
          createdDateObj: action.createdDateObj,
          todos: action.todos,
          userId: action.userId,
        },
      ];
    case REMOVE_TODOS:
      return state.filter(todo => {
        return todo.id !== action.id;
      });
    case EDIT_TODOS:
      const newState = [...state];
      return newState.map(todo => {
        if (todo.id !== action.todo.id) return todo;
        return {
          ...todo,
          ...action.todo,
        };
      });
    default:
      return state;
  }
};

const loginUser = (state = {}, action: any) => {
  switch (action.type) {
    case LOGIN:
      return {
        id: action.id,
        picture: action.picture,
        userName: action.userName,
        displayName: action.displayName,
        email: action.email,
        hasImage: action.hasImage || false,
      };
    case LOGOUT:
      return {};
    default:
      return state;
  }
};

const isLogin = (state = false, action: any) => {
  switch (action.type) {
    case LOGIN:
      return true;
    case LOGOUT:
      return false;
    default:
      return state;
  }
};

const isCheckingLogin = (state = true, action: any) => {
  switch (action.type) {
    case DONE_CHECKING:
      return false;
    default:
      return state;
  }
};

const reducer = combineReducers({
  timeline,
  loadMoreCount,
  loginUser,
  isLogin,
  isCheckingLogin,
  myTodos,
});

export const initializeStore = (preloadedState = {}) => {
  return createStore(reducer, preloadedState);
};
