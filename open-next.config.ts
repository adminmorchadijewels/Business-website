import { defineCloudflareConfig } from "@opennextjs/cloudflare";

/**
 * OpenNext Cloudflare adapter config.
 *
 * Deliberately minimal for the scaffolding phase: no incremental (ISR) cache
 * override is set yet, so caching falls back to the default. When R2 is
 * provisioned (later session), enable the R2 incremental cache here:
 *
 *   import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";
 *   export default defineCloudflareConfig({ incrementalCache: r2IncrementalCache });
 */
export default defineCloudflareConfig({});
