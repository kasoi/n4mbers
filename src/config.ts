interface AppConfig {
  PORT: number;
  DEV_MODE: boolean;
}

export const config: AppConfig = {
  PORT: parseInt(import.meta.env.VITE_PORT || '3010'),
  DEV_MODE: import.meta.env.NODE_ENV === 'development',
};