import React, { useState, useContext } from 'react'
import { useSelector } from 'react-redux'
import IInitialState from '../interfaces/IInitialState'
import getUnixTime from '../plugins/getUnixTime'
import { FirestoreContext } from './FirestoreContextProvider'
import uploadImage from '@taishikato/firebase-storage-uploader'
import firebase from '../plugins/firebase'
import 'firebase/storage'
import { Upload } from 'antd'
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons'
import 'antd/lib/upload/style/index.css'

type TImageUrl = string | null

const getBase64 = (img: File, callback: (imageUrl: TImageUrl) => void) => {
  const reader = new FileReader()
  reader.addEventListener('load', () => callback(reader.result as TImageUrl))
  reader.readAsDataURL(img)
}

const beforeUpload = (file: File) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
  if (!isJpgOrPng) {
    console.error('You can only upload JPG/PNG file!')
  }
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    console.error('Image must smaller than 2MB!')
  }
  return isJpgOrPng && isLt2M
}

const AddProject: React.FC<IProps> = ({ closeModal }) => {
  const [imageUrl, setImageUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const db = useContext(FirestoreContext)
  const projectRef = db.collection('projects')
  const loginUser = useSelector<IInitialState, IInitialState['loginUser']>(state => state.loginUser)
  const [project, setProject] = useState<{ [key: string]: string | number | boolean }>({
    name: '',
    description: '',
    url: '',
    tag: '',
    hasImage: false,
    created: 0,
    userId: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAddButtonDisabled, setIsAddButtonDisabled] = useState(true)
  const [duplicateTag, setDuplicateTag] = useState(false)
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    setIsAddButtonDisabled(true)
    const name = e.target.name
    const value = e.target.value
    const copiePproject = { ...project }
    copiePproject[name] = value
    setProject(copiePproject)
    if (copiePproject.name !== '' && copiePproject.description !== '' && copiePproject.tag !== '') {
      setIsAddButtonDisabled(false)
    }
  }
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setDuplicateTag(false)
    const projectData = await projectRef.where('tag', '==', project.tag).get()
    if (!projectData.empty) {
      setDuplicateTag(true)
      setIsSubmitting(false)
      return
    }
    if (imageUrl !== '') {
      await uploadImage(`/projects/${project.tag}.png`, imageUrl, firebase)
      project.hasImage = true
    }
    project.created = getUnixTime()
    project.userId = loginUser.id
    await projectRef.add(project)
    setIsSubmitting(false)
    closeModal()
  }
  const handleImageChange = (info: any) => {
    if (info.file.status === 'uploading') {
      setLoading(true)
      return
    }
    if (info.file.status === 'done') {
      getBase64(info.file.originFileObj, async (imageUrlVal: TImageUrl) => {
        setImageUrl(imageUrlVal as string)
        setLoading(false)
      })
    }
  }
  const uploadButton = (
    <div>
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div className="ant-upload-text">Upload</div>
    </div>
  )
  return (
    <div>
      <div className="bg-gray-200 py-3 border-b border-gray-300">
        <p className="text-2xl w-10/12 m-auto">新規プロジェクト</p>
      </div>
      <form onSubmit={handleSubmit} className="mt-6">
        <div className="w-10/12 m-auto">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
              名前
            </label>
            <input
              className="w-full border-2 border-gray-200 rounded py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-green-500"
              type="text"
              placeholder="次世代Instagram"
              value={project.name as string}
              name="name"
              onChange={e => handleFormChange(e)}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
              簡単な説明
            </label>
            <input
              className="w-full border-2 border-gray-200 rounded py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-green-500"
              type="text"
              name="description"
              value={project.description as string}
              onChange={e => handleFormChange(e)}
              placeholder="VRgram"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
              URL
            </label>
            <input
              className="w-full border-2 border-gray-200 rounded py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-green-500"
              type="url"
              name="url"
              value={project.url as string}
              onChange={e => handleFormChange(e)}
              placeholder="https://vrgram.com/"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              画像
            </label>
            <Upload
              name="avatar"
              listType="picture-card"
              className="avatar-uploader"
              showUploadList={false}
              action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
              beforeUpload={beforeUpload}
              onChange={handleImageChange}>
              {imageUrl ? <img src={imageUrl} alt="avatar" style={{ width: '100%' }} /> : uploadButton}
            </Upload>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
              タグ（To Doに#を付けて投稿することでTo Doとプロジェクトを紐付けることができます）
            </label>
            <input
              className="w-full border-2 border-gray-200 rounded py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-green-500"
              type="text"
              name="tag"
              value={project.tag as string}
              onChange={e => handleFormChange(e)}
              placeholder="vrgram"
            />
            {duplicateTag && <p className="text-sm text-red-500">このタグは既に使用されています</p>}
          </div>
        </div>

        <div className="bg-gray-200 mt-6 py-3 border-t border-gray-300">
          <div className="w-10/12 m-auto flex items-center justify-end">
            <div>
              {isSubmitting && (
                <button
                  disabled
                  className="px-5 p-2 rounded text-white bg-green-200 rounded font-semibold cursor-not-allowed">
                  送信中…
                </button>
              )}
              {isAddButtonDisabled && !isSubmitting && (
                <button
                  disabled
                  className="px-5 p-2 rounded text-white bg-green-200 rounded font-semibold cursor-not-allowed">
                  追加
                </button>
              )}
              {!isAddButtonDisabled && !isSubmitting && (
                <input
                  value="追加"
                  type="submit"
                  className="px-5 p-2 rounded text-white bg-green-400 hover:bg-green-500 rounded font-semibold cursor-pointer focus:outline-none"
                />
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

export default AddProject

interface IProps {
  closeModal: () => void
}
