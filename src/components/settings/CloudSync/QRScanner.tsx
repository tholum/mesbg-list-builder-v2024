import { Close, CameraAlt, Upload, Keyboard } from "@mui/icons-material";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
  Alert,
  Tabs,
  Tab,
  TextField,
  Input,
} from "@mui/material";
import { useState, useEffect, useRef, FunctionComponent } from "react";
import { QRScanner as QRScannerService } from "../../../services/config/qrScanner.ts";
import { ConfigQRData } from "../../../services/storage/types.ts";

interface QRScannerProps {
  open: boolean;
  onClose: () => void;
  onScanned: (data: ConfigQRData) => void;
}

type ScanMode = "camera" | "file" | "manual";

export const QRScanner: FunctionComponent<QRScannerProps> = ({
  open,
  onClose,
  onScanned,
}) => {
  const [mode, setMode] = useState<ScanMode>("camera");
  const [scanner, setScanner] = useState<QRScannerService | null>(null);
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(
    null,
  );
  const [error, setError] = useState<string>("");
  const [scanning, setScanning] = useState(false);
  const [manualData, setManualData] = useState({
    url: "",
    anonKey: "",
  });

  const scannerElementRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && mode === "camera") {
      initializeCamera();
    }

    return () => {
      cleanup();
    };
  }, [open, mode]);

  const initializeCamera = async () => {
    try {
      const hasPermission = await QRScannerService.checkCameraPermissions();
      setCameraPermission(hasPermission);

      if (hasPermission) {
        await startScanning();
      } else {
        setError(
          "Camera permission is required to scan QR codes. Please allow camera access and try again.",
        );
      }
    } catch (err) {
      setError("Could not initialize camera");
      setCameraPermission(false);
    }
  };

  const startScanning = async () => {
    if (!scannerElementRef.current) return;

    setScanning(true);
    setError("");

    try {
      const scannerInstance = new QRScannerService();
      setScanner(scannerInstance);

      await scannerInstance.startScanning(
        scannerElementRef.current.id,
        (data: ConfigQRData) => {
          onScanned(data);
          onClose();
        },
        (error: string) => {
          setError(error);
        },
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start camera");
      setScanning(false);
    }
  };

  const cleanup = async () => {
    if (scanner) {
      await scanner.stopScanning();
      setScanner(null);
    }
    setScanning(false);
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError("");

    try {
      const data = await QRScannerService.scanFromFile(file);
      onScanned(data);
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not read QR code from file",
      );
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleManualSubmit = () => {
    if (!manualData.url || !manualData.anonKey) {
      setError("Please fill in both URL and anon key");
      return;
    }

    try {
      // Create ConfigQRData from manual input
      const data: ConfigQRData = {
        app: "mesbg-list-builder",
        version: "1",
        url: manualData.url,
        anonKey: manualData.anonKey,
      };

      onScanned(data);
      onClose();
    } catch (err) {
      setError("Invalid configuration data");
    }
  };

  const handleClose = () => {
    cleanup();
    onClose();
  };

  const handleModeChange = (_: React.SyntheticEvent, newMode: ScanMode) => {
    cleanup();
    setMode(newMode);
    setError("");
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">Scan Configuration QR Code</Typography>
          <IconButton onClick={handleClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3}>
          <Tabs value={mode} onChange={handleModeChange}>
            <Tab
              icon={<CameraAlt />}
              label="Camera"
              value="camera"
              disabled={cameraPermission === false}
            />
            <Tab icon={<Upload />} label="Upload Image" value="file" />
            <Tab icon={<Keyboard />} label="Manual Entry" value="manual" />
          </Tabs>

          {error && <Alert severity="error">{error}</Alert>}

          {mode === "camera" && (
            <Box>
              {cameraPermission === null && (
                <Typography textAlign="center" py={4}>
                  Checking camera permissions...
                </Typography>
              )}

              {cameraPermission === false && (
                <Alert severity="warning">
                  Camera access is required to scan QR codes. Please allow
                  camera access in your browser settings and refresh the page.
                </Alert>
              )}

              {cameraPermission === true && (
                <Box>
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    Point your camera at the QR code to scan it automatically.
                  </Typography>

                  <Box
                    ref={scannerElementRef}
                    id="qr-scanner"
                    sx={{
                      minHeight: 300,
                      border: "2px dashed #ddd",
                      borderRadius: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {!scanning && (
                      <Typography color="text.secondary">
                        Initializing camera...
                      </Typography>
                    )}
                  </Box>
                </Box>
              )}
            </Box>
          )}

          {mode === "file" && (
            <Box>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Upload an image containing a QR code to scan it.
              </Typography>

              <Input
                ref={fileInputRef}
                type="file"
                inputProps={{ accept: "image/*" }}
                onChange={handleFileUpload}
                fullWidth
              />
            </Box>
          )}

          {mode === "manual" && (
            <Stack spacing={2}>
              <Typography variant="body2" color="text.secondary">
                Manually enter your Supabase configuration details.
              </Typography>

              <TextField
                label="Supabase URL"
                value={manualData.url}
                onChange={(e) =>
                  setManualData({ ...manualData, url: e.target.value })
                }
                placeholder="https://your-project.supabase.co"
                fullWidth
                size="small"
              />

              <TextField
                label="Anon Key"
                value={manualData.anonKey}
                onChange={(e) =>
                  setManualData({ ...manualData, anonKey: e.target.value })
                }
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                fullWidth
                size="small"
                multiline
                rows={3}
              />

              <Button
                variant="contained"
                onClick={handleManualSubmit}
                disabled={!manualData.url || !manualData.anonKey}
              >
                Apply Configuration
              </Button>
            </Stack>
          )}

          <Box display="flex" justifyContent="flex-end">
            <Button onClick={handleClose}>Cancel</Button>
          </Box>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};
