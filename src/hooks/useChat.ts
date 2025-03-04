import { useReducer, useRef, useEffect, useCallback } from 'react';
import { fetchConversation, saveConversation } from '../lib/api';
import { Message } from '../types/database.types';

interface UseChatProps {
  jobId?: string | null;
}

// Define action types
type ChatAction = 
  | { type: 'SET_MESSAGES'; payload: Message[] }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'UPDATE_MESSAGE'; payload: { index: number; message: Partial<Message> } }
  | { type: 'SET_INPUT'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_TYPING_MESSAGE'; payload: number | null }
  | { type: 'SET_CONVERSATION_LOADED'; payload: boolean }
  | { type: 'SET_JOB_ID'; payload: string | null }
  | { type: 'CLEAR_MESSAGES' };

// Define state interface
interface ChatState {
  messages: Message[];
  input: string;
  loading: boolean;
  currentlyTypingMessage: number | null;
  isConversationLoaded: boolean;
  jobId: string | null;
}

// Initial state
const initialState: ChatState = {
  messages: [{ role: 'assistant', content: "Let's create a new job posting. What's the job title?" }],
  input: '',
  loading: false,
  currentlyTypingMessage: null,
  isConversationLoaded: false,
  jobId: null
};

// Reducer function
function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'SET_MESSAGES':
      return { ...state, messages: action.payload };
    
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.payload] };
    
    case 'UPDATE_MESSAGE':
      return {
        ...state,
        messages: state.messages.map((msg, i) => 
          i === action.payload.index ? { ...msg, ...action.payload.message } : msg
        )
      };
    
    case 'SET_INPUT':
      return { ...state, input: action.payload };
    
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_TYPING_MESSAGE':
      return { ...state, currentlyTypingMessage: action.payload };
    
    case 'SET_CONVERSATION_LOADED':
      return { ...state, isConversationLoaded: action.payload };
    
    case 'SET_JOB_ID':
      return { ...state, jobId: action.payload };
    
    case 'CLEAR_MESSAGES':
      return {
        ...state,
        messages: [{ role: 'assistant', content: "Let's create a new job posting. What's the job title?" }]
      };
    
    default:
      return state;
  }
}

// Memoized responses for better performance
const ASSISTANT_RESPONSES = [
  "I can help you find qualified candidates for your open position.",
  "Would you like me to screen resumes for your job opening?",
  "I can schedule interviews with promising candidates.",
  "Let me analyze the job market trends for this position.",
  "I can draft a job description based on your requirements.",
  "Should we post this job on LinkedIn and other job boards?",
  "I can help you create a competitive compensation package.",
  "Would you like to set up an applicant tracking system?",
  "I can recommend skills assessments for this role.",
  "Let's create an interview process for this position."
];

export function useChat({ jobId: initialJobId }: UseChatProps = {}) {
  const [state, dispatch] = useReducer(chatReducer, {
    ...initialState,
    jobId: initialJobId || null
  });
  
  // Refs
  const chatEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const previousJobIdRef = useRef<string | null | undefined>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update jobId when it changes externally
  const updateJobId = useCallback((newJobId: string | null) => {
    dispatch({ type: 'SET_JOB_ID', payload: newJobId });
  }, []);

  // Load job-specific conversation
  useEffect(() => {
    const loadConversation = async () => {
      // If jobId changes, reset and potentially load conversation
      if (state.jobId !== previousJobIdRef.current) {
        previousJobIdRef.current = state.jobId;
        
        // Reset to default if no job is selected
        if (!state.jobId) {
          dispatch({ 
            type: 'SET_MESSAGES', 
            payload: [{ role: 'assistant', content: "Let's create a new job posting. What's the job title?" }] 
          });
          dispatch({ type: 'SET_CONVERSATION_LOADED', payload: true });
          return;
        }
        
        try {
          dispatch({ type: 'SET_CONVERSATION_LOADED', payload: false });
          const conversation = await fetchConversation(state.jobId);
          
          if (conversation && conversation.messages && conversation.messages.length > 0) {
            // Load existing conversation
            dispatch({ type: 'SET_MESSAGES', payload: conversation.messages as Message[] });
          } else {
            // Start a new conversation for this job
            dispatch({ 
              type: 'SET_MESSAGES', 
              payload: [{ role: 'assistant', content: 'What would you like to do with this job?' }] 
            });
          }
          dispatch({ type: 'SET_CONVERSATION_LOADED', payload: true });
        } catch (error) {
          console.error('Error loading conversation:', error);
          dispatch({ 
            type: 'SET_MESSAGES', 
            payload: [{ role: 'assistant', content: 'Error loading conversation history.' }] 
          });
          dispatch({ type: 'SET_CONVERSATION_LOADED', payload: true });
        }
      }
    };
    
    loadConversation();
  }, [state.jobId]);

  // Save conversation when messages change
  useEffect(() => {
    const saveCurrentConversation = async () => {
      if (state.jobId && state.isConversationLoaded && state.messages.length > 1) {
        try {
          await saveConversation(state.jobId, state.messages);
        } catch (error) {
          console.error('Error saving conversation:', error);
        }
      }
    };
    
    // Only save if we're not in the loading state
    if (!state.loading && state.isConversationLoaded) {
      // Clear any existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      // Set a new timeout for debounced saving
      saveTimeoutRef.current = setTimeout(() => {
        saveCurrentConversation();
      }, 1000); // Debounce saves to avoid too many requests
    }
    
    // Clean up the timeout on unmount
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [state.messages, state.jobId, state.loading, state.isConversationLoaded]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [state.messages]);

  // Handle message typing completion
  const handleTypingComplete = useCallback((index: number) => {
    dispatch({ 
      type: 'UPDATE_MESSAGE', 
      payload: { index, message: { isTyping: false } } 
    });
    dispatch({ type: 'SET_TYPING_MESSAGE', payload: null });
  }, []);

  // Add assistant message with typing effect
  const addAssistantMessage = useCallback((content: string) => {
    const newIndex = state.messages.length;
    dispatch({ type: 'SET_LOADING', payload: false });
    dispatch({ 
      type: 'ADD_MESSAGE', 
      payload: { role: 'assistant', content, isTyping: true } 
    });
    dispatch({ type: 'SET_TYPING_MESSAGE', payload: newIndex });
    return newIndex;
  }, [state.messages.length]);

  // Add user message
  const addUserMessage = useCallback((content: string) => {
    dispatch({ type: 'ADD_MESSAGE', payload: { role: 'user', content } });
    dispatch({ type: 'SET_LOADING', payload: true });
  }, []);

  // Generate a random assistant response
  const generateRandomResponse = useCallback(() => {
    return ASSISTANT_RESPONSES[Math.floor(Math.random() * ASSISTANT_RESPONSES.length)];
  }, []);

  // Clear input
  const clearInput = useCallback(() => {
    dispatch({ type: 'SET_INPUT', payload: '' });
  }, []);

  // Get the last assistant message
  const getLastAssistantMessage = useCallback(() => {
    return [...state.messages].reverse().find(m => m.role === 'assistant')?.content || '';
  }, [state.messages]);
  
  // Clear all messages and start fresh
  const clearMessages = useCallback(() => {
    dispatch({ type: 'CLEAR_MESSAGES' });
  }, []);

  // Set input value
  const setInput = useCallback((value: string) => {
    dispatch({ type: 'SET_INPUT', payload: value });
  }, []);

  // Set loading state
  const setLoading = useCallback((isLoading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: isLoading });
  }, []);

  return {
    messages: state.messages,
    input: state.input,
    setInput,
    loading: state.loading,
    setLoading,
    chatEndRef,
    messagesContainerRef,
    currentlyTypingMessage: state.currentlyTypingMessage,
    handleTypingComplete,
    addAssistantMessage,
    addUserMessage,
    generateRandomResponse,
    clearInput,
    clearMessages,
    getLastAssistantMessage,
    isConversationLoaded: state.isConversationLoaded,
    updateJobId
  };
}