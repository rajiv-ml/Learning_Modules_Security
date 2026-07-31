# Enterprise Learning App: Security Architecture

![React Native](https://img.shields.io/badge/React_Native-0.84.0-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?style=for-the-badge&logo=typescript)
![Security](https://img.shields.io/badge/Security-Zero_Trust-success?style=for-the-badge&logo=security)

A high-performance, enterprise-grade React Native application demonstrating advanced **Zero-Trust Token Architecture**, **Runtime Application Self-Protection (RASP)**, and **Cryptographic Device Binding**.

---

##  Key Features

- **Runtime Application Self-Protection (RASP)**: Actively monitors device integrity (Root/Jailbreak, Frida Hooking, Debuggers, Emulator usage) and dynamically adjusts risk scores.
- **Zero-Trust Token Rotation**: Mathematical binding of every session to the physical device it was initiated on, preventing token theft and replay attacks.
- **Aggressive Credential Scrubbing**: Redacts sensitive JWTs and UUIDs from memory buffers and Native logs before they reach centralized aggregators (Datadog, Crashlytics).
- **Optimized Asset Pipeline**: 97% reduction in asset payload over the Metro Bundler bridge, ensuring sub-second cold boot and fluid video playback.

---

##  Architecture Workflows

### Token Lifecycle & Replay Detection

Our architecture guarantees **Layer 2 Session Trust** by enforcing single-use refresh tokens and strict device ID validation.

```mermaid
sequenceDiagram
    participant User
    participant App as Mobile App (Keystore)
    participant Auth as SecurityPolicyEngine
    participant Interceptor as Axios Interceptor
    participant Backend as Mock Security Server

    %% 1. Session Establishment & Binding
    Note over User, Backend: 1. Login & Device Binding
    User->>App: Submits Credentials
    App->>Auth: Fetches Device UUID
    Auth->>Backend: POST /login (Credentials + DeviceId)
    Backend-->>App: Access Token, Refresh Token (UUID), SessionId
    App->>App: Encrypts Tokens into iOS Keychain / Android Keystore

    %% 2. Background State Machine
    Note over App, Backend: 2. Foreground / Background State Machine
    User->>App: Backgrounds App
    App->>App: SessionManager lockSession() (Clears Memory)
    User->>App: Foregrounds App
    App->>App: SessionManager unlockSession() (Decrypts from Keystore)
    App->>Backend: POST /auth/attest (Attestation)
    Backend-->>App: 200 OK

    %% 3. Token Rotation
    Note over App, Backend: 3. Token Rotation & Replay Detection
    App->>Backend: GET /api/protected (Expired Access Token)
    Backend-->>App: 401 Unauthorized
    App->>Interceptor: Intercept 401
    Interceptor->>Auth: Pause all API queues
    Interceptor->>Backend: POST /refresh (Old Refresh Token + DeviceId + SessionId)
    
    alt Validation Passed
        Backend->>Backend: Hash token, Compare DeviceId & SessionId
        Backend->>Backend: Mark Old Token as USED
        Backend-->>Interceptor: 200 OK (New Access Token, New Refresh Token)
        Interceptor->>Interceptor: Unpause queue, retry original request
    else Replay Detected (Theft)
        Backend->>Backend: Token is marked USED/REVOKED
        Backend->>Backend: REVOKE ENTIRE SESSION
        Backend-->>Interceptor: 401 Session Revoked Due to Replay
        Interceptor->>App: Force Logout & Wipe Keystore
    else Device Mismatch (Theft)
        Backend->>Backend: DeviceId does not match Session owner
        Backend->>Backend: REVOKE ENTIRE SESSION
        Backend-->>Interceptor: 403 Session Revoked Due to Device Mismatch
        Interceptor->>App: Force Logout & Wipe Keystore
    end
```

---

##  Security Validation Matrix

To ensure the architectural theory held up to practical exploitation, we built a UI testing suite directly into the application (accessible at the bottom of the Dashboard). All tests pass successfully:

| Test Scenario | Description | Status | Result |
| :--- | :--- | :---: | :--- |
| **Refresh Queueing** | A user makes 3 concurrent API requests right as their Access Token expires. | ✅ | Interceptor securely locks the queue, fires exactly *one* `/refresh`, and transparently replays all pending requests. |
| **Device Mismatch** | An attacker steals an active Session ID & Refresh Token and uses it from a foreign device. | ✅ | Backend detects device ID mismatch, immediately revokes session (`403`), and triggers the kill-chain. |
| **Replay Attack** | An attacker attempts to replay an older (but previously valid) Refresh Token. | ✅ | Backend detects Replay, permanently revokes the *entire* session, and blocks the legitimate user (`401`) to isolate the breach. |
| **Credential Masking** | Prevent raw JWTs and UUIDs from leaking into system logs. | ✅ | `SecurityLogger` successfully intercepts and scrubs sensitive JSON payloads to `[REDACTED]`. |

---

##  Getting Started

### 1. Start the Security Mock Backend

The mock server simulates a robust enterprise authentication backend (handling HMAC, Token Hashes, and Replay State Machines).

```bash
cd mock-security-server
npm install
npm run start:mock
```

### 2. Start the React Native App

```bash
# In a new terminal (root directory)
npm install
npm run start

# Then build the app
npm run android
# or
npm run ios
```
