# Security Guidelines

## 🔐 Credential Protection

This demo requires Firebolt Cloud service account credentials. Follow these guidelines to keep them secure:

### What's Protected by .gitignore

The following files are **excluded from git** and will never be committed:

```
.env                    # Root environment variables
.env.*                  # All .env variants
server/.env             # Server credentials
server/.env.*           # Server .env variants
*.pem                   # Private keys
*.key                   # Key files
*.secret                # Secret files
credentials.json        # Credential files
secrets.json            # Secret configurations
```

### Setting Up Credentials Safely

1. **Create the .env file locally:**
   ```bash
   cd server
   touch .env
   ```

2. **Add your credentials:**
   ```env
   FIREBOLT_ACCOUNT=your-account
   FIREBOLT_CLIENT_ID=your-client-id
   FIREBOLT_CLIENT_SECRET=your-client-secret
   FIREBOLT_DATABASE=your-database
   FIREBOLT_ENGINE=your-engine
   ```

3. **Verify it's ignored:**
   ```bash
   git status
   # .env should NOT appear in the list
   ```

### Service Account Best Practices

1. **Use dedicated service accounts** - Don't use personal credentials
2. **Limit permissions** - Grant only necessary database/engine access
3. **Rotate secrets regularly** - Update credentials periodically
4. **Never share credentials** - Each developer should have their own

### If You Accidentally Commit Credentials

1. **Immediately rotate the credentials** in Firebolt Console
2. **Remove from git history:**
   ```bash
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch server/.env" \
     --prune-empty --tag-name-filter cat -- --all
   ```
3. **Force push** (coordinate with team):
   ```bash
   git push origin --force --all
   ```

### Getting Service Account Credentials

1. Log in to [Firebolt Console](https://app.firebolt.io)
2. Navigate to **Configure** > **Service Accounts**
3. Create a new service account or use existing
4. Copy the **Client ID** and **Client Secret**

## 🛡️ Additional Security Measures

- The backend API server runs locally (port 3001) and is not exposed to the internet
- OAuth2 tokens are cached in memory only, not persisted to disk
- All communication with Firebolt Cloud uses HTTPS

## 📞 Reporting Security Issues

If you discover a security vulnerability, please report it responsibly:
- Do not create public GitHub issues for security vulnerabilities
- Contact the Firebolt security team directly

