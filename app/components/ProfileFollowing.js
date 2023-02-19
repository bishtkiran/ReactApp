import React, { useEffect, useState } from "react"
import Axios from "axios"
import { useParams, Link } from "react-router-dom"
import LoadingDotsIcon from "./LoadingDotsIcon"
import { useContext } from "react"
import StateContext from "../StateContext"

function ProfileFollowing(props) {
  const appState = useContext(StateContext)
  const { username } = useParams()
  const [isLoading, setIsLoading] = useState(true)
  const [posts, setPosts] = useState([])

  useEffect(() => {
    const ourRequest = Axios.CancelToken.source()

    async function fetchPosts() {
      const response = await Axios.get(`/profile/${username}/following`, { CancelToken: ourRequest.token })
      setPosts(response.data)
      setIsLoading(false)
    }
    fetchPosts()
    return () => {
      ourRequest.cancel()
    }
  }, [username])

  if (isLoading) return <LoadingDotsIcon />

  return (
    <div className="list-group">
      {posts.map((follower, index) => {
        return (
          <Link key={index} to={`/profile/${follower.username}`} className="list-group-item list-group-item-action">
            <img className="avatar-tiny" src={follower.avatar} /> {follower.username}
          </Link>
        )
      })}
      {posts.length == 0 && appState.user.username == username && <p className="lead text-muted text-center">You aren&rsquo;t following anyone yet.</p>}
      {posts.length == 0 && appState.user.username != username && <p className="lead text-muted text-center">{username} isn&rsquo;t following anyone yet.</p>}
    </div>
  )
}

export default ProfileFollowing
