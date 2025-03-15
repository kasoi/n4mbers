interface AppConfig {
  PORT: number;
  DEV_MODE: boolean;
}

export const config: AppConfig = {
  PORT: parseInt(process?.env?.VITE_PORT || '3010'),
  DEV_MODE: process?.env?.NODE_ENV === 'development',
};