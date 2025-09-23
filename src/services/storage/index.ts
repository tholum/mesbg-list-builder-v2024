import { StorageAdapter, SupabaseConfig } from "./types.ts";

/**
 * Storage factory that returns the appropriate storage adapter based on configuration
 */
export class StorageFactory {
  private static instance: StorageAdapter | null = null;

  /**
   * Get the appropriate storage adapter based on current configuration
   */
  static async getAdapter(): Promise<StorageAdapter> {
    // If we already have an instance, return it
    if (this.instance) {
      return this.instance;
    }

    // Check for Supabase configuration
    const supabaseConfig = this.getSupabaseConfig();

    if (supabaseConfig?.enabled) {
      try {
        // Dynamically import and create Supabase adapter
        const { SupabaseAdapter } = await import("./supabase.ts");
        const supabaseAdapter = new SupabaseAdapter(supabaseConfig);

        // Test connection
        const isConnected = await supabaseAdapter.isConnected();
        if (isConnected) {
          // Use hybrid adapter for best of both worlds
          const { HybridAdapter } = await import("./hybrid.ts");
          const { LocalStorageAdapter } = await import("./localStorage.ts");

          this.instance = new HybridAdapter(
            new LocalStorageAdapter(),
            supabaseAdapter,
          );
          return this.instance;
        }
      } catch (error) {
        console.warn(
          "Failed to initialize Supabase adapter, falling back to localStorage:",
          error,
        );
      }
    }

    // Fallback to localStorage adapter
    const { LocalStorageAdapter } = await import("./localStorage.ts");
    this.instance = new LocalStorageAdapter();
    return this.instance;
  }

  /**
   * Reset the storage adapter instance (useful for config changes)
   */
  static reset(): void {
    this.instance = null;
  }

  /**
   * Get Supabase configuration from localStorage
   */
  private static getSupabaseConfig(): SupabaseConfig | null {
    try {
      const config = localStorage.getItem("mlb-supabase-config");
      return config ? JSON.parse(config) : null;
    } catch (error) {
      console.warn("Failed to parse Supabase config:", error);
      return null;
    }
  }
}

/**
 * Convenience function to get storage adapter
 */
export async function getStorageAdapter(): Promise<StorageAdapter> {
  return StorageFactory.getAdapter();
}
