import { Download } from "@mui/icons-material";
import { Button, DialogContent, Stack } from "@mui/material";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import html2canvas from "html2canvas";
import { useRef, useState } from "react";
import { useScreenSize } from "../../../hooks/calculations-and-displays/useScreenSize.ts";
import { DatabaseRow } from "../../../pages/database/data.ts";
import { useAppState } from "../../../state/app";
import { DynamicProfileCard } from "../../atoms/unit-profile/DynamicProfileCard.tsx";

export const DynamicProfileCardModal = () => {
  const {
    modalContext: { row },
  } = useAppState();
  const { isMobile } = useScreenSize();
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!cardRef.current) return;

    try {
      setDownloading(true);

      // Use html2canvas to convert the card to an image
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2, // Higher quality
        logging: false,
        useCORS: true,
      });

      // Convert canvas to blob
      canvas.toBlob((blob) => {
        if (!blob) return;

        // Create download link
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${(row as DatabaseRow)?.name.replace(/[^a-z0-9]/gi, "_")}_profile_card.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        setDownloading(false);
      }, "image/png");
    } catch (error) {
      console.error("Error generating profile card image:", error);
      setDownloading(false);
    }
  };

  return (
    <>
      <DialogContent>
        <Stack spacing={2}>
          <Typography variant="body2">
            This is a dynamically generated profile card. You can download it as
            an image using the button below.
          </Typography>

          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
              gap: 2,
            }}
          >
            {row && (
              <Box
                sx={{
                  maxWidth: isMobile ? "100%" : "900px",
                  m: "auto",
                }}
              >
                <DynamicProfileCard ref={cardRef} row={row as DatabaseRow} />
              </Box>
            )}

            <Button
              variant="contained"
              color="primary"
              startIcon={<Download />}
              onClick={handleDownload}
              disabled={downloading}
              sx={{
                mt: 2,
                minWidth: "200px",
              }}
            >
              {downloading ? "Generating..." : "Download Card"}
            </Button>
          </Box>
        </Stack>
      </DialogContent>
    </>
  );
};
