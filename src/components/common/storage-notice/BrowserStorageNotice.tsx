import { AlertTitle } from "@mui/material";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";

export const BrowserStorageNotice = () => {
  function dismissStorageNotice() {}
  return (
    <Alert
      severity="warning"
      sx={{ m: "0 auto 1rem", maxWidth: "100ch" }}
      closeText="dismiss"
      onClose={dismissStorageNotice}
      icon={false}
    >
      <Box sx={{ maxWidth: "90ch" }}>
        <AlertTitle>
          <strong>Important Notice: Data Storage</strong>
        </AlertTitle>
        This application uses your browser’s{" "}
        <em>
          <b>local storage</b>
        </em>{" "}
        for saving data. Please note that any data saved here will be{" "}
        <em>
          <b>deleted if you clear your browser history or cache</b>
        </em>
        . To avoid losing your data, make use of the{" "}
        <em>
          <b>export options</b>
        </em>{" "}
        available via the floating action button in the bottom right corner of
        this page.
      </Box>
    </Alert>
  );
};
