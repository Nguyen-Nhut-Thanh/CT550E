"use client";
import { createContext } from "react";
import type { AccountResourceCache } from "shared";
export const ResourceContext = createContext<AccountResourceCache | null>(null);
