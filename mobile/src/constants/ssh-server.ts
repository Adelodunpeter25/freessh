// SSH Server Configuration
export const SSH_SERVER_CONFIG = {
  // Development - use local IP for device testing
  DEV_URL: 'ws://192.168.1.107:3001',
  DEV_API_URL: 'http://192.168.1.107:3001/api',
  
  // Production (update with your Coolify server URL)
  PROD_URL: 'wss://your-coolify-domain.com',
  PROD_API_URL: 'https://your-coolify-domain.com/api',
}

// Get current environment URLs
export const getSSHServerURL = () => {
  return __DEV__ ? SSH_SERVER_CONFIG.DEV_URL : SSH_SERVER_CONFIG.PROD_URL
}

export const getSSHServerAPIURL = () => {
  return __DEV__ ? SSH_SERVER_CONFIG.DEV_API_URL : SSH_SERVER_CONFIG.PROD_API_URL
}
