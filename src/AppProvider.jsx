import React, { useContext, useReducer } from "react";
import { addComment } from "./API/firebase";
const AppContext = React.createContext();

const useAppContext = () => {
  return useContext(AppContext);
};
const initialState = {
  currentMovie: 0,
  showComments: false,
  comments: [],
  userPhoto: null,
  userName: null,
  blocked: [],
  favorites: [],
};
const reducer = (state, action) => {
  switch (action.type) {
    case "SHOW_COMMENTS": {
      return {
        ...state,
        currentMovie: action.value,
        showComments: true,
      };
    }

    case "HIDE_COMMENTS": {
      return {
        ...state,
        currentMovie: null,
        showComments: false,
        comments: [],
      };
    }

    case "SAVE_COMMENT":
      addComment(state.currentMovie.id, action.value);
      return {
        ...state,
        comments: [action.value, ...state.comments],
      };

    case "GET_COMMENTS_COMPLETED":
      return {
        ...state,
        comments: action.value.reverse(),
      };

    case "UPDATE_USER_PHOTO":
      return {
        ...state,
        userPhoto: action.value,
      };

    case "UPDATE_USER_NAME":
      return {
        ...state,
        userName: action.value,
      };

    case "UPDATE_BLOCKED":
      return {
        ...state,
        blocked: action.value,
      };

    case "UPDATE_FAVORITES":
      return {
        ...state,
        favorites: action.value,
      };

    default:
      return state;
  }
};

const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <AppContext.Provider
      value={{
        currentMovie: state.currentMovie,
        showComments: state.showComments,
        comments: state.comments,
        userPhoto: state.userPhoto,
        userName: state.userName,
        blocked: state.blocked,
        favorites: state.favorites,
        state,
        dispatch,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
export { AppProvider, useAppContext };