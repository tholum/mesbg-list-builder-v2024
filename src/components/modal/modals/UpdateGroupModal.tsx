import { Button, DialogActions, DialogContent, TextField } from "@mui/material";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppState } from "../../../state/app";
import { useRosterBuildingState } from "../../../state/roster-building";
import { AlertTypes } from "../../alerts/alert-types.tsx";
import { CustomAlert } from "../../common/alert/CustomAlert.tsx";

export const UpdateGroupModal = () => {
  const {
    closeModal,
    modalContext: { groupId, redirect },
    triggerAlert,
  } = useAppState();
  const { updateRoster, rosters } = useRosterBuildingState();
  const navigate = useNavigate();

  const [rosterGroupName, setRosterGroupName] = useState(groupId);
  const [rosterGroupNameValid, setRosterGroupNameValid] = useState(true);

  const handleUpdateRosterGroup = (e) => {
    e.preventDefault();

    const rosterGroupNameValue = rosterGroupName.trim();
    const nameValid = !!rosterGroupNameValue;
    setRosterGroupNameValid(nameValid);

    if (nameValid) {
      rosters
        .filter((roster) => roster.group === groupId)
        .forEach((roster) => {
          updateRoster({
            ...roster,
            group: rosterGroupNameValue,
          });
        });
      if (redirect === true) {
        navigate(`/rosters/${rosterGroupNameValue}`);
      }
      triggerAlert(AlertTypes.UPDATE_GROUP_SUCCES);
      closeModal();
    }
  };

  function updateRosterGroupName(value: string) {
    setRosterGroupName(value);
    setRosterGroupNameValid(true);
  }

  return (
    <>
      <DialogContent sx={{ display: "flex", gap: 1, flexDirection: "column" }}>
        <CustomAlert severity="info" title="">
          <Typography>You can change the name of your group here.</Typography>
        </CustomAlert>
        <CustomAlert severity="warning" title="">
          <Typography>
            Please note that if the new name matches an existing group&apos;s
            name, the two groups will be merged into one!
          </Typography>
        </CustomAlert>

        <TextField
          sx={{ mt: 2 }}
          fullWidth
          label="New group name"
          error={!rosterGroupNameValid}
          helperText={
            !rosterGroupNameValid ? "The group name cannot be empty." : ""
          }
          value={rosterGroupName}
          onChange={(e) => updateRosterGroupName(e.target.value)}
        />
      </DialogContent>
      <DialogActions sx={{ display: "flex", gap: 2 }}>
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
          onClick={handleUpdateRosterGroup}
          disabled={!rosterGroupNameValid}
          data-test-id="dialog--submit-button"
        >
          Update group
        </Button>
      </DialogActions>
    </>
  );
};
