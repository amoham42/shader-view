// API Configuration
const API_CONFIG = {
  // Set to true for local development with the Node.js proxy
  // Set to false for production deployment with Vercel Go function
  USE_LOCAL_PROXY: false,
  
  // Local development endpoint
  LOCAL_ENDPOINT: "http://localhost:3000/shadertoy",
  
  // Production Vercel endpoint (replace with your actual domain)
  PRODUCTION_ENDPOINT: "https://your-project.vercel.app/api/shadertoy",
  
  // Get the appropriate endpoint based on configuration
  getEndpoint() {
    return this.USE_LOCAL_PROXY ? this.LOCAL_ENDPOINT : this.PRODUCTION_ENDPOINT;
  }
};

// Export for use in other modules
window.API_CONFIG = API_CONFIG; 