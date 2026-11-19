"use client";
import { createContext } from "react";

export type AccountResourceEntry = {
  data: unknown;
  loaded: boolean;
  updatedAt: number;
  pending?: Promise<unknown>;
};
export type AccountResourceCache = Map<string, AccountResourceEntry>;

export const ResourceContext = createContext<AccountResourceCache | null>(null);
