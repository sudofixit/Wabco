// Environment variable validation for production readiness

interface EnvConfig {
  NODE_ENV: string;
  DATABASE_URL: string;
  NEXTAUTH_URL: string;
  NEXTAUTH_SECRET: string;
  GOOGLE_MAPS_API_KEY: string;
}

function validateEnv(): EnvConfig {
  const requiredEnvVars = {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
  };

  const missingVars: string[] = [];

  // Check for missing environment variables
  Object.entries(requiredEnvVars).forEach(([key, value]) => {
    if (!value || value.trim() === '') {
      missingVars.push(key);
    }
  });

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}\n` +
      'Please check your .env.local file and ensure all required variables are set.'
    );
  }

  // Validate specific formats
  if (requiredEnvVars.DATABASE_URL && !requiredEnvVars.DATABASE_URL.startsWith('postgresql://')) {
    console.warn('DATABASE_URL should start with "postgresql://" for PostgreSQL databases');
  }

  if (requiredEnvVars.NODE_ENV === 'production') {
    // Additional production-specific validations
    if (requiredEnvVars.NEXTAUTH_URL && !requiredEnvVars.NEXTAUTH_URL.startsWith('https://')) {
      throw new Error('NEXTAUTH_URL must use HTTPS in production');
    }

    if (requiredEnvVars.NEXTAUTH_SECRET && requiredEnvVars.NEXTAUTH_SECRET.length < 32) {
      throw new Error('NEXTAUTH_SECRET must be at least 32 characters long in production');
    }
  }

  return requiredEnvVars as EnvConfig;
}

// Validate environment variables on module load
export const env = validateEnv();

// Helper function to check if we're in production
export const isProduction = env.NODE_ENV === 'production';

// Helper function to check if we're in development
export const isDevelopment = env.NODE_ENV === 'development';

// Export individual environment variables for convenience
export const {
  NODE_ENV,
  DATABASE_URL,
  NEXTAUTH_URL,
  NEXTAUTH_SECRET,
  GOOGLE_MAPS_API_KEY,
} = env; 