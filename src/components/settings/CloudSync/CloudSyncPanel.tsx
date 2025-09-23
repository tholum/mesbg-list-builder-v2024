import {
  Cloud,
  CloudOff,
  CloudSync,
  QrCode,
  QrCodeScanner,
  Science,
  Delete,
  Visibility,
  Help,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState, useEffect, FunctionComponent } from "react";
import { SupabaseConfigManager } from "../../../services/config/supabaseConfig.ts";
// Import QRGenerator only when needed to avoid unused import
import { StorageFactory } from "../../../services/storage/index.ts";
import { SupabaseAdapter } from "../../../services/storage/supabase.ts";
import {
  SupabaseConfig,
  ConfigQRData,
} from "../../../services/storage/types.ts";
import { QRDisplay } from "./QRDisplay.tsx";
import { QRScanner } from "./QRScanner.tsx";
import { SupabaseSetupHelp } from "./SupabaseSetupHelp.tsx";
import { AuthenticationPanel } from "./AuthenticationPanel.tsx";

type CloudSyncStatus =
  | "not-configured"
  | "configured"
  | "needs-auth"
  | "connected"
  | "error"
  | "testing";

export const CloudSyncPanel: FunctionComponent = () => {
  const [config, setConfig] = useState<SupabaseConfig | null>(null);
  const [status, setStatus] = useState<CloudSyncStatus>("not-configured");
  const [showQR, setShowQR] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [formData, setFormData] = useState({
    url: "",
    anonKey: "",
  });
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    const currentConfig = SupabaseConfigManager.getConfig();
    if (currentConfig) {
      setConfig(currentConfig);
      setFormData({
        url: currentConfig.url,
        anonKey: currentConfig.anonKey,
      });

      if (currentConfig.enabled) {
        await testConnection(currentConfig);
      } else {
        setStatus("configured");
      }
    } else {
      setStatus("not-configured");
    }
  };

  const testConnection = async (configToTest = config) => {
    if (!configToTest) return;

    setStatus("testing");
    setErrorMessage("");

    try {
      const isValid = await SupabaseConfigManager.testConnection(configToTest);

      if (isValid) {
        // Check if user is authenticated
        const supabaseAdapter = new SupabaseAdapter(configToTest);
        const isAuth = await supabaseAdapter.isAuthenticated();

        if (isAuth) {
          setStatus("connected");
        } else {
          setStatus("needs-auth");
        }

        // Reset storage adapter to use new config
        StorageFactory.reset();
      } else {
        setStatus("error");
        setErrorMessage(
          "Connection test failed. Please check your Supabase URL and anon key.",
        );
      }
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Connection test failed",
      );
    }
  };

  const handleSave = async () => {
    try {
      const newConfig = SupabaseConfigManager.createConfig(
        formData.url,
        formData.anonKey,
        true,
      );

      SupabaseConfigManager.saveConfig(newConfig);
      setConfig(newConfig);
      await testConnection(newConfig);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to save configuration",
      );
    }
  };

  const handleClear = () => {
    SupabaseConfigManager.clearConfig();
    setConfig(null);
    setFormData({ url: "", anonKey: "" });
    setStatus("not-configured");
    setErrorMessage("");
    StorageFactory.reset();
  };

  const handleQRScanned = (qrData: ConfigQRData) => {
    setFormData({
      url: qrData.url,
      anonKey: qrData.anonKey,
    });
    setShowScanner(false);
    setErrorMessage("");
  };

  const handleAuthSuccess = async () => {
    setStatus("connected");
    // Reset storage adapter to use authenticated connection
    StorageFactory.reset();
  };

  const getStatusInfo = () => {
    switch (status) {
      case "not-configured":
        return {
          icon: <CloudOff color="disabled" />,
          text: "Not configured",
          color: "default" as const,
        };
      case "configured":
        return {
          icon: <Cloud color="warning" />,
          text: "Configured (not enabled)",
          color: "warning" as const,
        };
      case "needs-auth":
        return {
          icon: <Cloud color="warning" />,
          text: "Sign in required",
          color: "warning" as const,
        };
      case "connected":
        return {
          icon: <CloudSync color="success" />,
          text: "Connected",
          color: "success" as const,
        };
      case "testing":
        return {
          icon: <Science color="info" />,
          text: "Testing connection...",
          color: "info" as const,
        };
      case "error":
        return {
          icon: <CloudOff color="error" />,
          text: "Connection error",
          color: "error" as const,
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <>
      <ListItem>
        <ListItemIcon>{statusInfo.icon}</ListItemIcon>
        <ListItemText
          primary="Cloud Sync"
          secondary="Sync your rosters, matches, and collection across devices"
        />
        <Chip
          label={statusInfo.text}
          color={statusInfo.color}
          variant="outlined"
          size="small"
        />
      </ListItem>

      <Box sx={{ px: 2, pb: 2 }}>
        {/* Show authentication panel when config exists but user is not authenticated */}
        {status === "needs-auth" && config && (
          <AuthenticationPanel
            config={config}
            onAuthSuccess={handleAuthSuccess}
          />
        )}

        {/* Show configuration panel when not authenticated or not fully configured */}
        {status !== "needs-auth" && (
          <Card variant="outlined">
            <CardContent>
              <Stack spacing={2}>
                {status === "not-configured" && (
                  <Box>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="body2" color="text.secondary">
                        Configure your Supabase project to enable cloud sync. You&apos;ll
                        need to provide your Supabase project URL and anon key.
                      </Typography>
                      <Button
                        size="small"
                        onClick={() => setShowHelp(true)}
                        startIcon={<Help />}
                        variant="outlined"
                      >
                        Setup Guide
                      </Button>
                    </Stack>
                  </Box>
                )}

                {errorMessage && (
                  <Typography variant="body2" color="error">
                    {errorMessage}
                  </Typography>
                )}

                <Stack spacing={2}>
                  <TextField
                    label="Supabase URL"
                    value={formData.url}
                    onChange={(e) =>
                      setFormData({ ...formData, url: e.target.value })
                    }
                    placeholder="https://your-project.supabase.co"
                    size="small"
                    fullWidth
                    disabled={status === "testing"}
                  />

                  <TextField
                    label="Anon Key"
                    value={formData.anonKey}
                    onChange={(e) =>
                      setFormData({ ...formData, anonKey: e.target.value })
                    }
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    size="small"
                    fullWidth
                    type={showPassword ? "text" : "password"}
                    disabled={status === "testing"}
                    InputProps={{
                      endAdornment: (
                        <Button
                          size="small"
                          onClick={() => setShowPassword(!showPassword)}
                          startIcon={<Visibility />}
                        >
                          {showPassword ? "Hide" : "Show"}
                        </Button>
                      ),
                    }}
                  />
                </Stack>

                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <Button
                    variant="contained"
                    onClick={handleSave}
                    disabled={
                      !formData.url || !formData.anonKey || status === "testing"
                    }
                    size="small"
                    startIcon={<Cloud />}
                  >
                    {config ? "Update" : "Save"} Config
                  </Button>

                  <Button
                    variant="outlined"
                    onClick={() => testConnection()}
                    disabled={!config || status === "testing"}
                    size="small"
                    startIcon={<Science />}
                  >
                    Test Connection
                  </Button>

                  {config && (
                    <Button
                      variant="outlined"
                      onClick={() => setShowQR(true)}
                      size="small"
                      startIcon={<QrCode />}
                    >
                      Show QR
                    </Button>
                  )}

                  <Button
                    variant="outlined"
                    onClick={() => setShowScanner(true)}
                    size="small"
                    startIcon={<QrCodeScanner />}
                  >
                    Scan QR
                  </Button>

                  {config && (
                    <Button
                      variant="text"
                      color="error"
                      onClick={handleClear}
                      size="small"
                      startIcon={<Delete />}
                    >
                      Clear Config
                    </Button>
                  )}
                </Stack>

                {status === "connected" && (
                  <Box sx={{ mt: 2 }}>
                    <Divider sx={{ mb: 2 }} />
                    <Typography variant="body2" color="success.main">
                      ✓ Cloud sync is active! Your data will automatically sync
                      across devices.
                    </Typography>
                  </Box>
                )}
              </Stack>
            </CardContent>
          </Card>
        )}
      </Box>

      {/* QR Display Modal */}
      <QRDisplay
        open={showQR}
        onClose={() => setShowQR(false)}
        config={config}
      />

      {/* QR Scanner Modal */}
      <QRScanner
        open={showScanner}
        onClose={() => setShowScanner(false)}
        onScanned={handleQRScanned}
      />

      {/* Supabase Setup Help Modal */}
      <SupabaseSetupHelp
        open={showHelp}
        onClose={() => setShowHelp(false)}
      />
    </>
  );
};
