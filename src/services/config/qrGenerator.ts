import QRCode from "qrcode";
import { SupabaseConfig, ConfigQRData } from "../storage/types.ts";

/**
 * QR Code generation utilities for sharing Supabase configuration
 */
export class QRGenerator {
  private static readonly APP_NAME = "mesbg-list-builder";
  private static readonly QR_VERSION = "1";

  /**
   * Generate QR code data URL from Supabase configuration
   */
  static async generateConfigQR(
    config: SupabaseConfig,
    includeSession = false,
  ): Promise<string> {
    // Get auth session if requested
    let session: string | undefined;
    if (includeSession) {
      try {
        session = await this.getCurrentSession(config);
      } catch (error) {
        console.warn("Could not get session for QR code:", error);
      }
    }

    const qrData: ConfigQRData = {
      app: this.APP_NAME,
      version: this.QR_VERSION,
      url: config.url,
      anonKey: config.anonKey,
      ...(session && { session }),
    };

    const qrString = JSON.stringify(qrData);

    try {
      return await QRCode.toDataURL(qrString, {
        width: 300,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
        errorCorrectionLevel: "M",
      });
    } catch (error) {
      console.error("Failed to generate QR code:", error);
      throw new Error("Could not generate QR code");
    }
  }

  /**
   * Parse and validate QR code data
   */
  static parseConfigQR(qrText: string): ConfigQRData {
    try {
      const data = JSON.parse(qrText);

      // Validate QR code format
      if (data.app !== this.APP_NAME) {
        throw new Error("This QR code is not for MESBG List Builder");
      }

      if (!data.version) {
        throw new Error("Invalid QR code format - missing version");
      }

      if (!data.url || !data.anonKey) {
        throw new Error(
          "Invalid QR code format - missing required configuration",
        );
      }

      return data as ConfigQRData;
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error("Invalid QR code format");
      }
      throw error;
    }
  }

  /**
   * Convert QR data to Supabase config
   */
  static qrDataToConfig(qrData: ConfigQRData): SupabaseConfig {
    return {
      url: qrData.url,
      anonKey: qrData.anonKey,
      enabled: true,
      lastValidated: Date.now(),
    };
  }

  /**
   * Generate a simple text representation of the config (fallback for manual entry)
   */
  static configToText(config: SupabaseConfig): string {
    return `MESBG List Builder Sync Config:
URL: ${config.url}
Anon Key: ${config.anonKey}

To set up sync on another device:
1. Go to Settings > Cloud Sync
2. Enter the URL and Anon Key above
3. Test connection and enable sync`;
  }

  /**
   * Get current auth session if available
   */
  private static async getCurrentSession(
    config: SupabaseConfig,
  ): Promise<string | undefined> {
    try {
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(config.url, config.anonKey);

      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error || !session) {
        return undefined;
      }

      return session.access_token;
    } catch (error) {
      console.warn("Could not get current session:", error);
      return undefined;
    }
  }
}
