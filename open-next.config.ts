import { defineCloudflareConfig } from '@opennextjs/cloudflare';
// import r2IncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache';

// No incremental cache yet: every page renders on request (the API itself is edge-cached).
// To cache pages for 10 minutes, enable R2 (see wrangler.jsonc) and pass `incrementalCache: r2IncrementalCache`.
export default defineCloudflareConfig({});
