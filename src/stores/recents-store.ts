"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

const MAX_RECENTS = 8;

type RecentsState = {
  recents: string[];
  favorites: string[];
  recordVisit: (toolId: string) => void;
  toggleFavorite: (toolId: string) => void;
  isFavorite: (toolId: string) => boolean;
};

export const useRecentsStore = create<RecentsState>()(
  persist(
    (set, get) => ({
      recents: [],
      favorites: [],
      recordVisit: (id) =>
        set((state) => ({
          recents: [id, ...state.recents.filter((item) => item !== id)].slice(
            0,
            MAX_RECENTS,
          ),
        })),
      toggleFavorite: (id) =>
        set((state) => ({
          favorites: state.favorites.includes(id)
            ? state.favorites.filter((item) => item !== id)
            : [id, ...state.favorites],
        })),
      isFavorite: (id) => get().favorites.includes(id),
    }),
    { name: "toolhub-recents" },
  ),
);
