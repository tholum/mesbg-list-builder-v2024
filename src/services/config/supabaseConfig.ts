import { SupabaseConfig } from "../storage/types.ts";

const SUPABASE_CONFIG_KEY = "mlb-supabase-config";

/**
 * Supabase configuration management utilities
 */
export class SupabaseConfigManager {
  /**
   * Get the current Supabase configuration
   */
  static getConfig(): SupabaseConfig | null {
    try {
      const config = localStorage.getItem(SUPABASE_CONFIG_KEY);
      return config ? JSON.parse(config) : null;
    } catch (error) {
      console.warn("Failed to parse Supabase config:", error);
      return null;
    }
  }

  /**
   * Save Supabase configuration to localStorage
   */
  static saveConfig(config: SupabaseConfig): void {
    try {
      const configWithTimestamp = {
        ...config,
        lastValidated: Date.now(),
      };

      localStorage.setItem(
        SUPABASE_CONFIG_KEY,
        JSON.stringify(configWithTimestamp),
      );

      // Dispatch custom event to notify other parts of the app
      window.dispatchEvent(
        new CustomEvent("supabase-config-changed", {
          detail: configWithTimestamp,
        }),
      );
    } catch (error) {
      console.error("Failed to save Supabase config:", error);
      throw new Error("Could not save configuration");
    }
  }

  /**
   * Update specific config properties
   */
  static updateConfig(updates: Partial<SupabaseConfig>): SupabaseConfig | null {
    const currentConfig = this.getConfig();
    if (!currentConfig) {
      return null;
    }

    const updatedConfig = {
      ...currentConfig,
      ...updates,
      lastValidated: Date.now(),
    };

    this.saveConfig(updatedConfig);
    return updatedConfig;
  }

  /**
   * Test the connection to Supabase with given configuration
   */
  static async testConnection(
    config: Pick<SupabaseConfig, "url" | "anonKey">,
  ): Promise<boolean> {
    try {
      // Dynamically import Supabase to avoid bundling if not used
      const { createClient } = await import("@supabase/supabase-js");

      const supabase = createClient(config.url, config.anonKey);

      // Test basic connection by getting session
      const { error } = await supabase.auth.getSession();

      // Even if no session, if there's no connection error, the config is valid
      return !error || !error.message.includes("Invalid");
    } catch (error) {
      console.warn("Supabase connection test failed:", error);
      return false;
    }
  }

  /**
   * Validate Supabase URL format
   */
  static validateUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      // Basic check for Supabase URL format
      return (
        urlObj.hostname.includes("supabase") && urlObj.protocol === "https:"
      );
    } catch {
      return false;
    }
  }

  /**
   * Validate Supabase anon key format (basic JWT format check)
   */
  static validateAnonKey(key: string): boolean {
    try {
      // Basic check for JWT format (3 parts separated by dots)
      const parts = key.split(".");
      if (parts.length !== 3) return false;

      // Try to decode the header to check if it's a JWT
      const header = JSON.parse(atob(parts[0]));
      return header.typ === "JWT" && header.alg;
    } catch {
      return false;
    }
  }

  /**
   * Enable or disable Supabase sync
   */
  static enableSync(enabled: boolean): void {
    this.updateConfig({ enabled });
  }

  /**
   * Remove Supabase configuration completely
   */
  static clearConfig(): void {
    localStorage.removeItem(SUPABASE_CONFIG_KEY);

    // Dispatch custom event to notify other parts of the app
    window.dispatchEvent(
      new CustomEvent("supabase-config-changed", {
        detail: null,
      }),
    );
  }

  /**
   * Check if Supabase is configured and enabled
   */
  static isConfigured(): boolean {
    const config = this.getConfig();
    return !!(config?.enabled && config?.url && config?.anonKey);
  }

  /**
   * Create a new config object with validation
   */
  static createConfig(
    url: string,
    anonKey: string,
    enabled = true,
  ): SupabaseConfig {
    if (!this.validateUrl(url)) {
      throw new Error("Invalid Supabase URL format");
    }

    if (!this.validateAnonKey(anonKey)) {
      throw new Error("Invalid Supabase anon key format");
    }

    return {
      url: url.trim(),
      anonKey: anonKey.trim(),
      enabled,
      lastValidated: Date.now(),
    };
  }
}
