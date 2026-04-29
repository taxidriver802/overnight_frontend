import { useContext } from "react";

import { AppThemeContext } from "@/context/theme-provider";

export function useTheme() {
  return useContext(AppThemeContext);
}
