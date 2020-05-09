import React, { useState, useEffect, useContext } from 'react'
import { useParams } from 'react-router-dom'
import Modal from 'react-modal'
import { useSelector } from 'react-redux'
import ProjectEdit from '../components/ProjectEdit'
import { FirestoreContext } from '../components/FirestoreContextProvider'
import IProject from '../interfaces/IProject'
import IInitialState from '../interfaces/IInitialState'
import ILoginUser from '../interfaces/ILoginUser'
import firebase from '../plugins/firebase'
import 'firebase/storage'

const Project = () => {
  const { tag } = useParams()
  const loginUser = useSelector<IInitialState, IInitialState['loginUser']>(state => state.loginUser)
  const db = useContext(FirestoreContext)
  const [projectState, setProjectState] = useState<IProject>({
    name: '',
    description: '',
    url: '',
    tag: '',
    created: 0,
    userId: '',
  })
  const [maker, setMaker] = useState<ILoginUser>({} as ILoginUser)
  const [isModalOpen, setIsModalOpen] = useState(false)
  useEffect(() => {
    const getProject = async () => {
      // プロジェクト取得
      const projectSnap = await db.collection('projects').where('tag', '==', tag).get()
      if (projectSnap.empty) return
      const project: IProject = projectSnap.docs[0].data() as IProject
      project.id = projectSnap.docs[0].id
      if (project.hasImage) {
        const imageUrl = await firebase
          .storage()
          .ref()
          .child(`/projects/thumbs/${project.tag}_200x200.png`)
          .getDownloadURL()
        project.image = imageUrl
      }
      setProjectState(project)
      // 作成者取得
      const snapshot = await db.collection('users').doc(project.userId).get()
      const user = snapshot.data() as ILoginUser
      setMaker(user)
    }
    getProject()
  }, [setProjectState, db, tag, setMaker])
  return (
    <>
      <div className="flex flex-wrap w-11/12 md:w-9/12 lg:w-9/12 mt-5 m-auto">
        <div className="flex mb-3 w-full md:w-8/12 lg:w-8/12">
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
            top: '40%',
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
  )
}

export default Project
