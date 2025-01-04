export const API_CONFIG = {
  leonardo: {
    baseUrl: 'https://cloud.leonardo.ai/api/rest/v1',
    modelId: 'e71a1c2f-4f80-4800-934f-2c68979d8cc8',
    styleUUID: '32b653d2-8819-4363-bc82-a6466dfcb825',
    version: 'SDXL_LIGHTNING',
  },
  internal: {
    baseUrl: '/api',
    endpoints: {
      heroName: '/hero-name'
    }
  }
} as const;
