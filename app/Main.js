import React, { useState, useReducer, useEffect, Suspense } from "react"
import ReactDOM from "react-dom/client"
import Header from "./components/Header"
import Footer from "./components/Footer"
import HomeGuest from "./components/HomeGuest"
import About from "./components/About"
import Terms from "./components/Terms"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { useImmerReducer } from "use-immer"
import Home from "./components/Home"
const CreatePost = React.lazy(() => import("./components/CreatePost"))
import { CSSTransition } from "react-transition-group"
import Axios from "axios"
const ViewSinglePost = React.lazy(() => import("./components/ViewSinglePost"))
import FlashMessages from "./components/FlashMessages"
import StateContext from "./StateContext"
import DispatchContext from "./DispatchContext"
import Profile from "./components/Profile"
import EditPost from "./components/EditPost"
import NotFound from "./components/NotFound"
const Search = React.lazy(() => import("./components/Search"))
const Chat = React.lazy(() => import("./components/Chat"))
import LoadingDotsIcon from "./components/LoadingDotsIcon"
Axios.defaults.baseURL = process.env.BACKENDURL || ""

function Main() {
  const initialState = {
    loggedIn: Boolean(localStorage.getItem("complexAppToken")),
    flashMessages: [],
    user: {
      token: localStorage.getItem("complexAppToken"),
      username: localStorage.getItem("complexAppUsername"),
      avatar: localStorage.getItem("complexAppAvatar")
    },
    isSearchOpen: false,
    isChatOpen: false,
    unreadChatCount: 0
  }

  function ourReducer(draft, action) {
    switch (action.type) {
      case "login":
        ;(draft.loggedIn = true), (draft.user = action.data)
        return
      case "logout":
        draft.loggedIn = false
        return
      case "flashMessage":
        draft.flashMessages.push(action.value)
        return
      case "openSearch":
        draft.isSearchOpen = true
        return
      case "closeSearch":
        draft.isSearchOpen = false
        return
      case "toggleChat":
        draft.isChatOpen = !draft.isChatOpen
        return
      case "closeChat":
        draft.isChatOpen = false
        return
      case "incrementUnreadChatCount":
        draft.unreadChatCount++
        return
      case "clearUnreadChatCount":
        draft.unreadChatCount = 0
        return
    }
  }

  const [state, dispatch] = useImmerReducer(ourReducer, initialState)

  useEffect(() => {
    if (state.loggedIn) {
      localStorage.setItem("complexAppToken", state.user.token)
      localStorage.setItem("complexAppUsername", state.user.username)
      localStorage.setItem("complexAppAvatar", state.user.avatar)
    } else {
      localStorage.removeItem("complexAppToken")
      localStorage.removeItem("complexAppUsername")
      localStorage.removeItem("complexAppAvatar")
    }
  }, [state.loggedIn])

  function addFlashMessage(msg) {
    setFlashMessages(prev => prev.concat(msg))
  }

  useEffect(() => {
    if (state.loggedIn) {
      const ourRequest = Axios.CancelToken.source()

      async function fetchResults() {
        try {
          const response = await Axios.post("/checkToken", { token: state.user.token }, { cancelToken: ourRequest.token })
          if (!response.data) {
            dispatch({ type: "logout" })
            dispatch({ type: "flashMessage", value: "Session Expired. Please Login again." })
          }
        } catch (e) {
          console.log("Error while fetching search results!!")
        }
      }
      fetchResults()
      return () => ourRequest.cancel()
    }
  }, [])
  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        <BrowserRouter>
          <FlashMessages messages={state.flashMessages} />
          <Header />
          <Suspense fallback={<LoadingDotsIcon />}>
            <Routes>
              <Route path="/" element={state.loggedIn ? <Home /> : <HomeGuest />} />
              <Route path="/post/:id" element={<ViewSinglePost />} />
              <Route path="/create-post" element={<CreatePost />} />
              <Route path="/profile/:username/*" element={<Profile />} />
              <Route path="/post/:id/edit" element={<EditPost />} />
              <Route path="/about-us" element={<About />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          <CSSTransition timeout={330} in={state.isSearchOpen} classNames="search-overlay" unmountOnExit>
            <div className="search-overlay">
              <Suspense fallback="">
                <Search />
              </Suspense>
            </div>
          </CSSTransition>
          <Suspense fallback="">{state.loggedIn && <Chat />}</Suspense>
          <Footer />
        </BrowserRouter>
      </DispatchContext.Provider>
    </StateContext.Provider>
  )
}

const root = ReactDOM.createRoot(document.querySelector("#app"))
root.render(<Main />)

if (module.hot) {
  module.hot.accept()
}
