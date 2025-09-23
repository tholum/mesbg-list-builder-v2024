import { Close, ContentCopy, QrCode2 } from "@mui/icons-material";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Typography,
  Alert,
} from "@mui/material";
import { useState, useEffect, FunctionComponent } from "react";
import { QRGenerator } from "../../../services/config/qrGenerator.ts";
import { SupabaseConfig } from "../../../services/storage/types.ts";

interface QRDisplayProps {
  open: boolean;
  onClose: () => void;
  config: SupabaseConfig | null;
}

export const QRDisplay: FunctionComponent<QRDisplayProps> = ({
  open,
  onClose,
  config,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [configText, setConfigText] = useState<string>("");

  useEffect(() => {
    if (open && config) {
      generateQR();
    }
  }, [open, config]);

  const generateQR = async () => {
    if (!config) return;

    setLoading(true);
    setError("");

    try {
      const dataUrl = await QRGenerator.generateConfigQR(config);
      setQrDataUrl(dataUrl);

      const textConfig = QRGenerator.configToText(config);
      setConfigText(textConfig);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate QR code",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopyConfig = async () => {
    try {
      await navigator.clipboard.writeText(configText);
      // You could add a toast notification here
    } catch (err) {
      console.warn("Could not copy to clipboard:", err);
    }
  };

  const handleCopyUrl = async () => {
    if (!config) return;

    try {
      await navigator.clipboard.writeText(config.url);
    } catch (err) {
      console.warn("Could not copy URL to clipboard:", err);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <QrCode2 />
            <Typography variant="h6">Share Configuration</Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3}>
          <Alert severity="info">
            Scan this QR code on your other device to quickly set up cloud sync.
          </Alert>

          {loading && (
            <Box display="flex" justifyContent="center" py={4}>
              <Typography>Generating QR code...</Typography>
            </Box>
          )}

          {error && <Alert severity="error">{error}</Alert>}

          {qrDataUrl && (
            <Box display="flex" justifyContent="center">
              <img
                src={qrDataUrl}
                alt="Supabase Configuration QR Code"
                style={{
                  maxWidth: "100%",
                  height: "auto",
                  border: "1px solid #ddd",
                  borderRadius: 8,
                }}
              />
            </Box>
          )}

          {config && (
            <Stack spacing={2}>
              <Typography variant="subtitle2">Manual Configuration</Typography>

              <Stack direction="row" spacing={1} alignItems="center">
                <TextField
                  label="Supabase URL"
                  value={config.url}
                  size="small"
                  fullWidth
                  InputProps={{ readOnly: true }}
                />
                <IconButton onClick={handleCopyUrl} size="small">
                  <ContentCopy fontSize="small" />
                </IconButton>
              </Stack>

              <Stack direction="row" spacing={1} alignItems="center">
                <TextField
                  label="Anon Key"
                  value={config.anonKey}
                  size="small"
                  fullWidth
                  InputProps={{ readOnly: true }}
                  type="password"
                />
                <IconButton
                  onClick={() => navigator.clipboard.writeText(config.anonKey)}
                  size="small"
                >
                  <ContentCopy fontSize="small" />
                </IconButton>
              </Stack>
            </Stack>
          )}

          <Box display="flex" justifyContent="space-between">
            <Button
              variant="outlined"
              onClick={handleCopyConfig}
              startIcon={<ContentCopy />}
              size="small"
            >
              Copy as Text
            </Button>

            <Button onClick={onClose}>Close</Button>
          </Box>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};
