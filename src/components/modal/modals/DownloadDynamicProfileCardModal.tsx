import {
  Button,
  DialogActions,
  DialogContent,
  ImageList,
  ImageListItem,
  LinearProgress,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { saveAs } from "file-saver";
import html2canvas from "html2canvas";
import JSZip from "jszip";
import { useEffect, useRef, useState } from "react";
import hero_constraint_data from "../../../assets/data/hero_constraint_data.json";
import { profileData } from "../../../assets/data.ts";
import { useRosterInformation } from "../../../hooks/calculations-and-displays/useRosterInformation.ts";
import { DatabaseRow } from "../../../pages/database/data.ts";
import { useAppState } from "../../../state/app";
import { Unit } from "../../../types/mesbg-data.types.ts";
import { isSelectedUnit } from "../../../types/roster.ts";
import { CustomAlert } from "../../atoms/alert/CustomAlert.tsx";
import { DynamicProfileCard } from "../../atoms/unit-profile/DynamicProfileCard.tsx";
import { AlertTypes } from "../../notifications/alert-types.tsx";

export const DownloadDynamicProfileCardModal = () => {
  const { roster } = useRosterInformation();
  const { closeModal, triggerAlert } = useAppState();
  const [profileCards, setProfileCards] = useState<DatabaseRow[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentCard, setCurrentCard] = useState<string>("");
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.down("lg"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Convert Unit to DatabaseRow format
  const convertUnitToRow = (unit: Unit): DatabaseRow | null => {
    const profile = profileData[unit.profile_origin]?.[unit.name];
    if (!profile) return null;

    const [M, W, F] = unit.MWFW?.[0]?.[1]?.split(":") || ["-", "-", "-"];

    return {
      name: unit.name,
      profile_origin: unit.profile_origin,
      unit_type: Array.isArray(unit.unit_type)
        ? unit.unit_type
        : [unit.unit_type],
      profile,
      M,
      W,
      F,
      army_type: unit.army_type,
      army_list: [unit.army_list],
      option_mandatory: false,
      options: [],
      MWFW: unit.MWFW || [],
      Mv: 0,
      searchString: "",
    } as DatabaseRow;
  };

  // Generate unique card list from roster
  useEffect(() => {
    const cards: DatabaseRow[] = [];
    const uniqueKeys = new Set<string>();

    roster.warbands.forEach((warband) => {
      // Add hero
      if (warband.hero) {
        const key = [warband.hero.profile_origin, warband.hero.name].join("|");
        if (!uniqueKeys.has(key)) {
          uniqueKeys.add(key);
          const row = convertUnitToRow(warband.hero);
          if (row) cards.push(row);
        }

        // Add extra profiles for heroes
        if (
          warband.hero.unit_type !== "Siege Engine" &&
          hero_constraint_data[warband.hero.model_id]?.["extra_profiles"]
            ?.length > 0
        ) {
          hero_constraint_data[warband.hero.model_id]["extra_profiles"].forEach(
            (profileName: string) => {
              const key = [warband.hero.profile_origin, profileName].join("|");
              if (!uniqueKeys.has(key)) {
                uniqueKeys.add(key);
                const extraProfile =
                  profileData[warband.hero.profile_origin]?.[profileName];
                if (extraProfile) {
                  // Create a DatabaseRow for the extra profile
                  cards.push({
                    name: profileName,
                    profile_origin: warband.hero.profile_origin,
                    unit_type: [warband.hero.unit_type],
                    profile: extraProfile,
                    M: "-",
                    W: "-",
                    F: "-",
                    army_type: warband.hero.army_type,
                    army_list: [warband.hero.army_list],
                    option_mandatory: false,
                    options: [],
                    MWFW: [],
                    Mv: 0,
                    searchString: "",
                  } as DatabaseRow);
                }
              }
            },
          );
        }
      }

      // Add units
      warband.units.filter(isSelectedUnit).forEach((unit) => {
        if (unit.unit_type !== "Siege Equipment") {
          const key = [unit.profile_origin, unit.name].join("|");
          if (!uniqueKeys.has(key)) {
            uniqueKeys.add(key);
            const row = convertUnitToRow(unit);
            if (row) cards.push(row);
          }
        }
      });
    });

    setProfileCards(cards);
  }, [roster]);

  const handleDownload = async () => {
    if (profileCards.length === 0) {
      triggerAlert(AlertTypes.DOWNLOAD_FAILED);
      return;
    }

    try {
      setIsDownloading(true);
      setProgress(0);

      const zip = new JSZip();

      for (let i = 0; i < profileCards.length; i++) {
        const card = profileCards[i];
        const cardKey = `${card.profile_origin}|${card.name}`;
        setCurrentCard(card.name);

        const cardElement = cardRefs.current.get(cardKey);
        if (!cardElement) {
          console.warn(`Card element not found for ${cardKey}`);
          continue;
        }

        // Use html2canvas to convert the card to an image
        const canvas = await html2canvas(cardElement, {
          backgroundColor: null,
          scale: 2, // Higher quality
          logging: false,
          useCORS: true,
        });

        // Convert canvas to blob
        const blob = await new Promise<Blob | null>((resolve) => {
          canvas.toBlob((blob) => resolve(blob), "image/png");
        });

        if (blob) {
          const fileName = `${card.name.replace(/[^a-z0-9]/gi, "_")}.png`;
          zip.file(fileName, blob, { binary: true });
        }

        // Update progress
        setProgress(((i + 1) / profileCards.length) * 100);
      }

      // Generate and download zip file
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const ts = new Date();
      saveAs(
        zipBlob,
        `MESBG-Dynamic-Profile-Cards-${ts.toISOString().substring(0, 19)}.zip`,
      );

      setIsDownloading(false);
      closeModal();
    } catch (error) {
      console.error("Error generating profile cards:", error);
      triggerAlert(AlertTypes.DOWNLOAD_FAILED);
      setIsDownloading(false);
    }
  };

  const setCardRef = (key: string, element: HTMLDivElement | null) => {
    if (element) {
      cardRefs.current.set(key, element);
    } else {
      cardRefs.current.delete(key);
    }
  };

  return (
    <>
      <DialogContent>
        <CustomAlert severity="info" title="">
          The following profile cards will be downloaded as dynamically
          generated HTML cards.
        </CustomAlert>

        {isDownloading && (
          <div style={{ marginTop: 16, marginBottom: 16 }}>
            <Typography variant="body2" gutterBottom>
              Generating card: {currentCard} ({Math.round(progress)}%)
            </Typography>
            <LinearProgress variant="determinate" value={progress} />
          </div>
        )}

        <ImageList cols={isMobile ? 1 : isTablet ? 2 : isDesktop ? 3 : 4}>
          {profileCards.map((card, index) => {
            const cardKey = `${card.profile_origin}|${card.name}`;
            return (
              <ImageListItem key={index} cols={1}>
                <div
                  ref={(el) => setCardRef(cardKey, el)}
                  style={{
                    transform: "scale(0.5)",
                    transformOrigin: "top left",
                    width: "200%",
                    marginBottom: "-200px",
                  }}
                >
                  <DynamicProfileCard row={card} />
                </div>
              </ImageListItem>
            );
          })}
        </ImageList>
      </DialogContent>
      <DialogActions>
        <Button
          variant="text"
          color="inherit"
          onClick={closeModal}
          sx={{ minWidth: "20ch" }}
          data-test-id="dialog--cancel-button"
          disabled={isDownloading}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleDownload}
          sx={{ minWidth: "20ch" }}
          data-test-id="dialog--submit-button"
          disabled={isDownloading || profileCards.length === 0}
        >
          {isDownloading ? "Generating..." : "Download"}
        </Button>
      </DialogActions>
    </>
  );
};
