import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import Modal from 'react-modal';
import { useSelector } from 'react-redux';
import ProjectEdit from '../components/ProjectEdit';
import { FirestoreContext } from '../components/FirestoreContextProvider';
import TodoForShow from '../components/TodoForShow';
import Todo from '../components/Todo';
import IProject from '../interfaces/IProject';
import IInitialState from '../interfaces/IInitialState';
import ILoginUser from '../interfaces/ILoginUser';
import { ITodoNew } from '../interfaces/ITodo';
import firebase from '../plugins/firebase';
import 'firebase/storage';

const Project = () => {
  const { tag } = useParams();
  const loginUser = useSelector<IInitialState, IInitialState['loginUser']>(state => state.loginUser);
  const db = useContext(FirestoreContext);
  const [projectState, setProjectState] = useState<IProject>({
    name: '',
    description: '',
    url: '',
    tag: '',
    created: 0,
    userId: '',
  });
  const [doneTodos, setDoneTodos] = useState<ITodoNew[]>([]);
  const [todos, setTodos] = useState<ITodoNew[]>([]);
  const [maker, setMaker] = useState<ILoginUser>({} as ILoginUser);
  const [isModalOpen, setIsModalOpen] = useState(false);
  useEffect(() => {
    const getProject = async () => {
      // プロジェクト取得
      const projectSnap = await db.collection('projects').where('tag', '==', tag).get();
      if (projectSnap.empty) return;
      const project: IProject = projectSnap.docs[0].data() as IProject;
      project.id = projectSnap.docs[0].id;
      if (project.hasImage) {
        const imageUrl = await firebase
          .storage()
          .ref()
          .child(`/projects/thumbs/${project.id}_200x200.png`)
          .getDownloadURL();
        project.image = imageUrl;
      }
      setProjectState(project);
      // 作成者取得
      const snapshot = await db.collection('users').doc(project.userId).get();
      const user = snapshot.data() as ILoginUser;
      setMaker(user);

      // 作者なら未完TODOも表示
      if (user.id === loginUser.id) {
        const todosSnap = await db
          .collection('todos')
          .where('userId', '==', user.id)
          .where('tag', '==', tag)
          .where('checked', '==', false)
          .orderBy('created', 'desc')
          .limit(10)
          .get();
        setTodos(todosSnap.docs.map(doc => doc.data()) as ITodoNew[]);
      }

      // TODO取得
      const doneTodosSnap = await db
        .collection('todos')
        .where('userId', '==', user.id)
        .where('tag', '==', tag)
        .where('checked', '==', true)
        .orderBy('doneDate', 'desc')
        .get();
      setDoneTodos(doneTodosSnap.docs.map(doc => doc.data()) as ITodoNew[]);
    };
    getProject();
  }, [setProjectState, db, tag, setMaker, setDoneTodos, loginUser]);
  return (
    <>
      <div className="flex flex-wrap w-11/12 md:w-9/12 lg:w-9/12 mt-5 m-auto">
        <div className="w-full md:w-8/12 lg:w-8/12">
          <div className="flex mb-3">
            {projectState.hasImage && <img src={projectState.image} alt="" className="w-20 h-20 rounded-full mr-3" />}
            <div>
              <span className="text-xl font-semibold">{projectState.name}</span>
              {projectState.userId === loginUser.id && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="text-xs px-2 py-1 ml-3 bg-gray-200 rounded-full focus:outline-none">
                  編集
                </button>
              )}
              {projectState.url !== '' && projectState.url !== undefined && (
                <div>
                  <a href={projectState.url} target="_blank" className="text-blue-500" rel="noopener noreferrer">
                    {projectState.url}
                  </a>
                </div>
              )}
              <div>{projectState.description}</div>
            </div>
          </div>
          {todos.length > 0 && (
            <div className="mt-10">
              <div className="font-medium text-lg mb-3">未完TODO</div>
              {todos.map(todo => (
                <div key={todo.id} className="border-2 rounded border-gray-300 p-3 mb-3">
                  <Todo todo={todo} />
                </div>
              ))}
            </div>
          )}
          {doneTodos.length > 0 && (
            <div className="mt-10">
              <div className="font-medium text-lg mb-3">完了TODO</div>
              {doneTodos.map(todo => (
                <div key={todo.id} className="border-2 rounded border-gray-300 p-3 mb-3">
                  <TodoForShow todo={todo} />
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="w-full md:w-4/12 lg:w-4/12">
          <div className="p-4 border-2 border-gray-300 rounded">
            <div className="text-sm font-semibold mb-3">作成者</div>
            <div className="flex items-center">
              <img src={maker.picture} alt="プロフィール写真" className="rounded-full w-10 h-10" />
              <div className="ml-2">{maker.displayName}</div>
            </div>
          </div>
        </div>
      </div>
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        ariaHideApp={false}
        style={{
          overlay: {
            zIndex: 100000,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
          },
          content: {
            padding: 0,
            width: '600px',
            maxWidth: '100%',
            position: 'absolute',
            top: '50%',
            left: '50%',
            bottom: 'none',
            transform: 'translateY(-50%)translateX(-50%)',
            border: 'none',
            backgroundColor: 'white',
          },
        }}>
        <ProjectEdit project={projectState} closeModal={() => setIsModalOpen(false)} />
      </Modal>
    </>
  );
};

export default Project;
