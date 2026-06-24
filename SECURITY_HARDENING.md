# Repository Security & Hardening Guide

This document outlines the strict Git and Infrastructure rules required to prevent Supply Chain attacks and insider threats against the LearningApp repository.

## 1. Branch Protection Rules

The `main` and `release` branches must be protected against direct pushes and unauthorized modifications.

**Required Settings (GitHub / GitLab):**
- **Require a pull request before merging.**
- **Require approvals:** Minimum of `1` approval for standard code.
- **Strict Code Owners (`CODEOWNERS`):**
  - Any modifications to the `security/`, `auth/`, or `payment/` directories require **2 approvals** specifically from Senior Security Engineers.
  - Create a `.github/CODEOWNERS` file:
    ```
    /android/security_native/ @sec-lead @arch-lead
    /ios/LearningApp/Security/ @sec-lead @arch-lead
    /backend-reference/auth/ @backend-lead
    ```
- **Require status checks to pass before merging:**
  - `secret-scanning` must pass.
  - `semgrep-sast` must pass.
  - `codeql-sast` must pass.

## 2. Commit Signing (SSH/GPG)

Every commit entering the repository must be cryptographically signed to prevent impersonation (e.g., an attacker pushing code under a legitimate developer's email).

**SSH Signing Setup (Recommended for UX):**
1. Generate an SSH key: `ssh-keygen -t ed25519 -C "your_email@example.com"`
2. Tell Git to use SSH for signing:
   ```bash
   git config --global gpg.format ssh
   git config --global user.signingkey /path/to/public/key.pub
   git config --global commit.gpgsign true
   ```
3. Upload the SSH Public Key to GitHub as a "Signing Key".

## 3. SLSA (Supply-chain Levels for Software Artifacts) Build Provenance

To ensure the APK installed on a user's phone matches the exact source code in Git, we must adopt SLSA Level 2+ practices.

**The Provenance Triangle:**
1. **Source Integrity:** Verified by SSH signed commits.
2. **Build Integrity:** The build runs on a dedicated ephemeral GitHub Actions runner, isolated from local developer machines.
3. **Artifact Integrity:** The final `app-release.apk` is hashed (SHA-256) inside the isolated runner.
4. **SBOM:** A CycloneDX `bom.json` is attached to the release.

If an attacker compromises the Google Play Console and uploads a rogue APK, you can download it, hash it, and prove it does not match the securely generated hash in your SLSA Provenance logs, proving a breach occurred *after* the build pipeline.
