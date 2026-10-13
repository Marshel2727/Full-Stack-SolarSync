export const cachePolicy = {
  gcTime: 600000, catalog: 300000, dashboard: 15000, energy: 60000, requests: 0,
  refetchIntervalInBackground: false,
} as const;
export const privateKey = (userId: string | undefined, ...parts: unknown[]) => ['private', userId, ...parts];
