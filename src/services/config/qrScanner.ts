import {
  Html5QrcodeScanner,
  Html5QrcodeScanType,
  Html5QrcodeResult,
} from "html5-qrcode";
import { ConfigQRData } from "../storage/types.ts";
import { QRGenerator } from "./qrGenerator.ts";

/**
 * QR Code scanner utilities for reading Supabase configuration
 */
export class QRScanner {
  private scanner: Html5QrcodeScanner | null = null;

  /**
   * Start QR code scanning
   */
  async startScanning(
    elementId: string,
    onSuccess: (config: ConfigQRData) => void,
    onError: (error: string) => void,
  ): Promise<void> {
    // Stop any existing scanner
    await this.stopScanning();

    try {
      this.scanner = new Html5QrcodeScanner(
        elementId,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
          showTorchButtonIfSupported: true,
          showZoomSliderIfSupported: true,
        },
        /* verbose= */ false,
      );

      this.scanner.render(
        (decodedText: string, _result: Html5QrcodeResult) => {
          try {
            // Parse QR code data
            const configData = QRGenerator.parseConfigQR(decodedText);
            onSuccess(configData);

            // Automatically stop scanning on success
            this.stopScanning();
          } catch (error) {
            const message =
              error instanceof Error ? error.message : "Invalid QR code";
            onError(message);
          }
        },
        (errorMessage: string) => {
          // Scanning errors (not critical, just means no QR code found yet)
          console.debug("QR scan error:", errorMessage);
        },
      );
    } catch (error) {
      console.error("Failed to start QR scanner:", error);
      onError("Could not start camera. Please check camera permissions.");
    }
  }

  /**
   * Stop QR code scanning and clean up resources
   */
  async stopScanning(): Promise<void> {
    if (this.scanner) {
      try {
        await this.scanner.clear();
      } catch (error) {
        console.warn("Error stopping QR scanner:", error);
      } finally {
        this.scanner = null;
      }
    }
  }

  /**
   * Check if camera permissions are available
   */
  static async checkCameraPermissions(): Promise<boolean> {
    try {
      // Check if navigator.mediaDevices is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        return false;
      }

      // Try to get camera permissions
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }, // Prefer back camera
      });

      // Stop the stream immediately as we're just checking permissions
      stream.getTracks().forEach((track) => track.stop());

      return true;
    } catch (error) {
      console.warn("Camera permissions not available:", error);
      return false;
    }
  }

  /**
   * Get available cameras
   */
  static async getCameras(): Promise<MediaDeviceInfo[]> {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        return [];
      }

      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.filter((device) => device.kind === "videoinput");
    } catch (error) {
      console.warn("Could not enumerate cameras:", error);
      return [];
    }
  }

  /**
   * Parse QR code from an image file
   */
  static async scanFromFile(file: File): Promise<ConfigQRData> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async (_event) => {
        try {
          // Create a temporary scanner for file scanning
          const tempElement = document.createElement("div");
          tempElement.style.display = "none";
          document.body.appendChild(tempElement);

          const { Html5Qrcode } = await import("html5-qrcode");
          const html5QrCode = new Html5Qrcode(tempElement.id);

          try {
            const result = await html5QrCode.scanFile(file, true);
            const configData = QRGenerator.parseConfigQR(result);
            resolve(configData);
          } catch (scanError) {
            reject(new Error("Could not read QR code from image"));
          } finally {
            // Clean up
            await html5QrCode.clear();
            document.body.removeChild(tempElement);
          }
        } catch (error) {
          reject(new Error("Could not process image file"));
        }
      };

      reader.onerror = () => {
        reject(new Error("Could not read image file"));
      };

      reader.readAsDataURL(file);
    });
  }
}
