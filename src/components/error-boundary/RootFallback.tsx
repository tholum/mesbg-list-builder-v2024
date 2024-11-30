import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";

export const RootFallback = () => {
  return (
    <>
      <Container
        maxWidth="md"
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          p: 2,
        }}
      >
        <Typography variant="h3">
          One does not simply walk into an error...
        </Typography>
        <Typography variant="subtitle1">
          todo... add more information!
        </Typography>
      </Container>
    </>
  );
};
