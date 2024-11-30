import { Button, DialogActions, DialogContent } from "@mui/material";
import { useRef } from "react";
import { useAppState } from "../../../state/app";
import {
  GameResultsForm,
  GameResultsFormHandlers,
} from "../../common/game-results-form/GameResultsForm.tsx";

export const CreateGameResultModal = () => {
  const { closeModal, modalContext } = useAppState();
  const childRef = useRef<GameResultsFormHandlers>(null);

  const saveGameToState = () => {
    if (childRef.current) {
      if (childRef.current.saveToState()) {
        closeModal();
      }
    }
  };

  return (
    <>
      <DialogContent>
        <GameResultsForm ref={childRef} />
      </DialogContent>
      <DialogActions>
        <Button
          variant="text"
          color="inherit"
          onClick={closeModal}
          sx={{ minWidth: "20ch" }}
          data-test-id="dialog--cancel-button"
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={saveGameToState}
          sx={{ minWidth: "20ch" }}
          data-test-id="dialog--submit-button"
        >
          {modalContext.mode} game
        </Button>
      </DialogActions>
    </>
  );
};
