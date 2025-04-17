import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { Post, User, Comment, socialApi } from '../services/api';

// Define the state type
interface SocialState {
  posts: Post[];
  currentUser: User | null;
  isLoading: boolean;
  error: string | null;
}

// Define action types
type SocialAction =
  | { type: 'SET_POSTS'; payload: Post[] }
  | { type: 'ADD_POST'; payload: Post }
  | { type: 'SET_CURRENT_USER'; payload: User | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'UPDATE_POST_LIKES'; payload: { postId: number; isLiked: boolean } };

// Create the context
const SocialContext = createContext<{
  state: SocialState;
  loadPosts: (page?: number) => Promise<void>;
  createPost: (content: string, media?: File[]) => Promise<void>;
  likePost: (postId: number) => Promise<void>;
  unlikePost: (postId: number) => Promise<void>;
} | null>(null);

// Initial state
const initialState: SocialState = {
  posts: [],
  currentUser: null,
  isLoading: false,
  error: null
};

// Reducer function
function socialReducer(state: SocialState, action: SocialAction): SocialState {
  switch (action.type) {
    case 'SET_POSTS':
      return { ...state, posts: action.payload };
    case 'ADD_POST':
      return { ...state, posts: [action.payload, ...state.posts] };
    case 'SET_CURRENT_USER':
      return { ...state, currentUser: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'UPDATE_POST_LIKES':
      return {
        ...state,
        posts: state.posts.map(post =>
          post.id === action.payload.postId
            ? {
                ...post,
                is_liked: action.payload.isLiked,
                likes_count: action.payload.isLiked
                  ? post.likes_count + 1
                  : post.likes_count - 1
              }
            : post
        )
      };
    default:
      return state;
  }
}

// Provider component
export const SocialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(socialReducer, initialState);

  const loadPosts = useCallback(async (page = 1) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await socialApi.getPosts(page);
      dispatch({ type: 'SET_POSTS', payload: response.data.data });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load posts' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const createPost = useCallback(async (content: string, media?: File[]) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await socialApi.createPost({ content, media });
      dispatch({ type: 'ADD_POST', payload: response.data });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create post' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const likePost = useCallback(async (postId: number) => {
    try {
      await socialApi.likePost(postId);
      dispatch({ type: 'UPDATE_POST_LIKES', payload: { postId, isLiked: true } });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to like post' });
    }
  }, []);

  const unlikePost = useCallback(async (postId: number) => {
    try {
      await socialApi.unlikePost(postId);
      dispatch({ type: 'UPDATE_POST_LIKES', payload: { postId, isLiked: false } });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to unlike post' });
    }
  }, []);

  return (
    <SocialContext.Provider value={{ state, loadPosts, createPost, likePost, unlikePost }}>
      {children}
    </SocialContext.Provider>
  );
};

// Custom hook for using the social context
export const useSocial = () => {
  const context = useContext(SocialContext);
  if (!context) {
    throw new Error('useSocial must be used within a SocialProvider');
  }
  return context;
}; 