# Private Cloud Sync — Supabase Setup

**Status:** An optional, deployable backend integration, but **not a preconfigured live cloud account**. GitHub Pages only hosts the static frontend. The owner must create and configure a private Supabase project before cross-device saving works. No subscription or account registration has been authorized by this repository.

## What gets saved

A full McGruber backup created in the browser, including inventory, repair notes, project and notebook state, 3D configuration, and referenced private photos/media. The cloud limit is **30 MiB per encrypted file**; base64 expands file size, so fewer than 30 MiB of original media may fit. If attachments are missing or too large, the upload stops and local data is retained. Export a normal full local backup before enabling cloud sync.

Data is encrypted client-side with PBKDF2-HMAC-SHA-256 (310,000 iterations, random 16-byte salt) and AES-256-GCM (new 12-byte IV). The provider can see Auth identity, connection metadata, timestamps, object length and ciphertext—not the unencrypted inventory/photos, assuming the browser and served application are trustworthy. The **separate vault passphrase** must be remembered securely; neither Supabase nor McGruber can recover it.

## Activate a private backend (owner action required)

1. Create a private Supabase project and review the current free-plan limits and terms. In its SQL editor apply [the private vault migration](migrations/202610240001_private_vault.sql). It creates the owner-only head table, private Storage bucket, RLS policies, atomic commit RPC and safe aged-object cleanup policy. Confirm the migration executes without errors.
2. In **Authentication → Email templates → Magic Link / OTP**, ensure the email contains the token variable shown in the Supabase docs: {{ .Token }} . The site uses numeric email codes rather than clicking a magic link. Enable Email Auth and suitable throttling, and configure secure email delivery. For a personal private lab, prefer an invitation-only signup policy after your account is created.
3. Open [McGruber Backups & settings](https://jimedusot-beep.github.io/project-mcgruber/#/settings), expand **Secure cross-device sync**, and enter your HTTPS project URL (e.g. https://PROJECT-REF.supabase.co) and **PUBLIC** publishable/anon key (e.g. sb_publishable_...). These settings can be exposed publicly; never enter a service_role, sb_secret, access token, database password or GitHub PAT.
4. Request an email one-time code and verify it in McGruber. This stores the authorized session in sessionStorage for the current browser tab, not in GitHub or the repository. Sign out or close the session to remove it.
5. Download a complete unencrypted or encrypted **local recovery backup**, then enter and confirm a separate strong passphrase. If this account has no cloud snapshot, choose **Encrypt and sync this browser now**. The immutable ciphertext upload occurs before the atomic head commit.
6. On another authorized device, sign into the **same account**, enter the **same passphrase**, and choose **Restore cloud copy to this browser**. Decryption and authentication occur before any local replacement. **Export any unsynced local content first.** Previous local recovery revisions remain available; the restore does not merge simultaneous changes.
7. Optionally select **Enable auto-sync for this tab** after a successful push or restore. Local IndexedDB saves trigger encrypted snapshot uploads after a debounce (45 seconds) and at most about one every ten minutes. Auto-sync is disabled after page close, sign-out, or sync errors. It does **not** pull and replace another device's changes automatically. New remote changes stop uploads with an explicit conflict until the owner exports, reviews and restores deliberately.

## Safety boundaries

- **Private by default.** The bucket is private. RLS grants signed-in users access only under their own UUID prefix. The head table denies public mutations and reveals only the owner's row. The RPC is granted only to authenticated users; it checks the caller's UUID, object ownership, path, expected revision and size.
- **CAS, not last-write-wins.** Concurrent uploads create unique immutable encrypted objects. The head pointer only advances if its revision matches the last accepted revision. A stale push fails without replacing the latest data. An orphan encrypted upload can later be pruned, but never within 24 hours or while it is the live head.
- **No secrets in GitHub.** The frontend stores a public URL/key in origin-local preferences; refresh tokens live in sessionStorage, and the vault passphrase is only in memory during an unlocked tab. Browser-origin XSS is a real threat to web-session credentials. Only use the official trusted McGruber site, keep dependencies reviewed, and do not install untrusted scripts.
- **Quotas and retention.** Each encrypted snapshot is limited to 30 MiB. Upload history is not a permanent revision archive. Periodically select **Remove old unreferenced cloud snapshots** after 24 hours. Keep independent local encrypted exports. No vendor billing commitment is included.
- **Local resilience.** IndexedDB autosave, ten-revision history, manual encrypted transfer and recovery remain operational when the remote backend is offline or unconfigured. A remote failure does not delete local data.
- **No automatic two-way merge yet.** The milestone provides optional auto-upload and explicit user-confirmed pull. Semantic record-level merge across divergent devices requires a separate, evidence-tested revision/merge model.

## Verification before trusting real data

The repository's Node tests simulate account sign-in, encrypted upload, download/decrypt, wrong passphrases, two-device conflicts, denied secrets/URLs and SQL policy contracts. Browser tests verify the UI without a provider. These **do not verify real Supabase RLS, email delivery, quota behavior or an actual iPhone**.

Before real production use, activate a disposable test project and verify these gates:

- Two distinct signed-in users cannot read/download/delete each other's head or encrypted files. Unauthenticated public/anon requests cannot access private data.
- Two device sessions with the same account uploading concurrently cannot advance the head twice from the same parent revision; a stale user gets SYNC_CONFLICT and remains locally safe.
- A wrong passphrase, modified ciphertext, 30-MiB rejection, interrupted upload, expired token and malformed SQL RPC request leave local data intact.
- An expired/orphan object older than 24 hours may be removed, but a live head object and every recently uploaded object are protected.
- Inventory, notebook results, 3D settings and actual owner-controlled photo attachments survive a complete remote upload/download/restore on Chrome and Safari.
- Check rate limits, account recovery and privacy deletion in Supabase, and test for browser quota eviction. A GitHub Pages site cannot host a private server.

Official references: [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security),
[Storage access](https://supabase.com/docs/guides/storage/security/access-control),
[File-size limits](https://supabase.com/docs/guides/storage/uploads/file-limits),
[Email codes](https://supabase.com/docs/guides/auth/auth-email-passwordless).

**Nothing in this migration authorizes purchase or auto-deployment of an external provider.**
