"use client";

import { useAtom } from "jotai";

import { activeSideBarItem } from "@/configs/constants";

export const useSidebar = () => {
  const [activeSidebar, setActiveSidebar] = useAtom(activeSideBarItem);
  return { activeSidebar, setActiveSidebar };
};
