import React, { useState, useContext } from 'react'
import { useSelector } from 'react-redux'
import moment from 'moment-timezone'
import axios from 'axios'
import Skeleton from 'react-loading-skeleton'
import { FirestoreContext } from './FirestoreContextProvider'
import TodoForShow from './TodoForShow'
import IInitialState from '../interfaces/IInitialState'
import { ITodoData as ITodoData2 } from '../interfaces/ITodoData'
import { ITodoNew } from '../interfaces/ITodo'

moment.locale('ja')

const SinglePostWrapper = () => {
  const [isLoading, setIsLoading] = useState(true)
  const loginUser = useSelector<IInitialState, IInitialState['loginUser']>(state => state.loginUser)
  const [postsNew, setPostsNew] = useState<ITodoData2[]>([])
  const db = useContext(FirestoreContext)

  React.useEffect(() => {
    const getPosts2 = async () => {
      const [todayPosts, yesterdayPosts, twoaysAgo] = await Promise.all([
        axios.post('https://asia-northeast1-peer-learning-app.cloudfunctions.net/getTodosApiFunc/getTodos', {
          dayBefore: 0,
        }),
        axios.post('https://asia-northeast1-peer-learning-app.cloudfunctions.net/getTodosApiFunc/getTodos', {
          dayBefore: 1,
        }),
        axios.post('https://asia-northeast1-peer-learning-app.cloudfunctions.net/getTodosApiFunc/getTodos', {
          dayBefore: 2,
        }),
      ])

      const postData = [todayPosts.data]
      postData.push(yesterdayPosts.data)
      postData.push(twoaysAgo.data)

      setPostsNew(postData)
      setIsLoading(false)
    }

    getPosts2()
  }, [loginUser.id, db, setIsLoading, setPostsNew])
  return (
    <>
      {isLoading ? (
        <Skeleton count={3} />
      ) : (
        <>
          {postsNew.map((postObj: any) => (
            <div key={postObj.date} className="mb-5">
              <h3 className="text-xl mb-5">{moment(postObj.date).tz('Asia/Tokyo').format('MM月DD日(ddd)')}</h3>
              {postObj.todoByUser.length === 0 ? (
                <>No ToDo</>
              ) : (
                postObj.todoByUser.map((todoData: any) => (
                  <div key={todoData.user.userName} className="bg-white rounded mb-4 border-2 border-gray-300">
                    <div className="flex items-center p-3 border-b border-gray-300">
                      <img src={todoData.user.picture} alt="プロフィール写真" className="rounded-full w-10 h-10" />
                      <span className="ml-3 font-medium">{todoData.user.displayName}</span>
                    </div>
                    {todoData.todos.map((todo: ITodoNew) => (
                      <div key={todo.id} className="todo-component-wrapper p-3 border-b border-gray-300">
                        <TodoForShow todo={todo} />
                      </div>
                    ))}
                  </div>
                ))
              )}
            </div>
          ))}
        </>
      )}
    </>
  )
}

export default SinglePostWrapper

interface IPost {
  id: string
  post: ITodoData
  user: any
}

interface ITodoData {
  id?: string
  created: number
  createdDate: string
  createdDateObj: string
  todos: ITodo[]
  userId: string
}

interface ITodo {
  id: string
  text: string
  checked: boolean
}
