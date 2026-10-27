import type { Dispatch, SetStateAction } from "react";

export type ShowHowType = {
  ShowHow: boolean;
  setShowHow: Dispatch<SetStateAction<boolean>>;
};
