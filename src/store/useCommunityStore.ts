import { create } from 'zustand';

interface CacheState<T> {
  data: T[];
  lastDoc: any;
  hasMore: boolean;
  isLoaded: boolean;
}

interface CommunityStore {
  globalFeed: CacheState<any>;
  articles: CacheState<any>;
  projects: CacheState<any>;
  discussions: CacheState<any>;

  setGlobalFeed: (data: any[], lastDoc: any, hasMore: boolean) => void;
  appendGlobalFeed: (data: any[], lastDoc: any, hasMore: boolean) => void;

  setArticles: (data: any[], lastDoc: any, hasMore: boolean) => void;
  appendArticles: (data: any[], lastDoc: any, hasMore: boolean) => void;

  setProjects: (data: any[], lastDoc: any, hasMore: boolean) => void;
  appendProjects: (data: any[], lastDoc: any, hasMore: boolean) => void;

  setDiscussions: (data: any[], lastDoc: any, hasMore: boolean) => void;
  appendDiscussions: (data: any[], lastDoc: any, hasMore: boolean) => void;
  
  clearCache: () => void;
}

const initialCache = {
  data: [],
  lastDoc: null,
  hasMore: true,
  isLoaded: false
};

export const useCommunityStore = create<CommunityStore>((set) => ({
  globalFeed: { ...initialCache },
  articles: { ...initialCache },
  projects: { ...initialCache },
  discussions: { ...initialCache },

  setGlobalFeed: (data, lastDoc, hasMore) => set({ globalFeed: { data, lastDoc, hasMore, isLoaded: true } }),
  appendGlobalFeed: (data, lastDoc, hasMore) => set((state) => ({ 
    globalFeed: { ...state.globalFeed, data: [...state.globalFeed.data, ...data], lastDoc, hasMore } 
  })),

  setArticles: (data, lastDoc, hasMore) => set({ articles: { data, lastDoc, hasMore, isLoaded: true } }),
  appendArticles: (data, lastDoc, hasMore) => set((state) => ({ 
    articles: { ...state.articles, data: [...state.articles.data, ...data], lastDoc, hasMore } 
  })),

  setProjects: (data, lastDoc, hasMore) => set({ projects: { data, lastDoc, hasMore, isLoaded: true } }),
  appendProjects: (data, lastDoc, hasMore) => set((state) => ({ 
    projects: { ...state.projects, data: [...state.projects.data, ...data], lastDoc, hasMore } 
  })),

  setDiscussions: (data, lastDoc, hasMore) => set({ discussions: { data, lastDoc, hasMore, isLoaded: true } }),
  appendDiscussions: (data, lastDoc, hasMore) => set((state) => ({ 
    discussions: { ...state.discussions, data: [...state.discussions.data, ...data], lastDoc, hasMore } 
  })),

  clearCache: () => set({
    globalFeed: { ...initialCache },
    articles: { ...initialCache },
    projects: { ...initialCache },
    discussions: { ...initialCache }
  })
}));
