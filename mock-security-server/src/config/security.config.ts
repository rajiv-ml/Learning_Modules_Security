export interface SecurityConfigProps {
  jwtExpiry: string;
  refreshExpiry: string;
  nonceTtlMs: number;
  replayWindowMs: number;
  riskThreshold: {
    biometric: number;
    relogin: number;
    block: number;
    revoke: number;
  };
}

export const testingConfig: SecurityConfigProps = {
  jwtExpiry: '30s',
  refreshExpiry: '2m',
  nonceTtlMs: 15000,
  replayWindowMs: 5000,
  riskThreshold: {
    biometric: 30,
    relogin: 50,
    block: 70,
    revoke: 90
  }
};

export const stagingConfig: SecurityConfigProps = {
  jwtExpiry: '15m',
  refreshExpiry: '30d',
  nonceTtlMs: 60000,
  replayWindowMs: 30000,
  riskThreshold: {
    biometric: 30,
    relogin: 50,
    block: 70,
    revoke: 90
  }
};

const env = process.env.NODE_ENV || 'testing';
export const SecurityConfig = env === 'testing' ? testingConfig : stagingConfig;
