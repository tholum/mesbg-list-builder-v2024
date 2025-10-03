import { Download } from "@mui/icons-material";
import { Button, DialogContent, Stack } from "@mui/material";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import html2canvas from "html2canvas";
import { useMemo, useRef, useState } from "react";
import { profileData } from "../../../assets/data.ts";
import { useScreenSize } from "../../../hooks/calculations-and-displays/useScreenSize.ts";
import { DatabaseRow } from "../../../pages/database/data.ts";
import { useAppState } from "../../../state/app";
import { Unit } from "../../../types/mesbg-data.types.ts";
import { DynamicProfileCard } from "../../atoms/unit-profile/DynamicProfileCard.tsx";

export const DynamicProfileCardModal = () => {
  const {
    modalContext: { row, unit },
  } = useAppState();
  const { isMobile } = useScreenSize();
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  // Convert Unit to DatabaseRow format if needed
  const cardData = useMemo((): DatabaseRow | null => {
    if (row) return row as DatabaseRow;
    if (!unit) return null;

    const u = unit as Unit;
    const profile = profileData[u.profile_origin]?.[u.name];
    if (!profile) return null;

    const [M, W, F] = u.MWFW?.[0]?.[1]?.split(":") || ["-", "-", "-"];

    return {
      name: u.name,
      profile_origin: u.profile_origin,
      unit_type: Array.isArray(u.unit_type) ? u.unit_type : [u.unit_type],
      profile,
      M,
      W,
      F,
      army_type: u.army_type,
      army_list: [u.army_list],
      option_mandatory: false,
      options: [],
      MWFW: u.MWFW || [],
      Mv: 0,
      searchString: "",
    } as DatabaseRow;
  }, [row, unit]);

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
        link.download = `${cardData?.name.replace(/[^a-z0-9]/gi, "_")}_profile_card.png`;
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
            {cardData && (
              <Box
                sx={{
                  maxWidth: isMobile ? "100%" : "900px",
                  m: "auto",
                }}
              >
                <DynamicProfileCard ref={cardRef} row={cardData} />
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
