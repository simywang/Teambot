# Teams App Package

This directory contains the Teams app manifest and icons for publishing the bot to Microsoft Teams.

## Setup

1. **Update manifest.json**:
   - Replace `YOUR_APP_ID_HERE` with a new GUID (you can generate one at https://www.uuidgenerator.net/)
   - Replace `YOUR_BOT_APP_ID_HERE` with your Microsoft Bot App ID (from Azure Bot Service)
   - Update company information (name, website, privacy, terms URLs)
   - Customize bot name and description if needed

2. **Create Icons**:
   - `color.png`: 192x192 pixels, full color icon
   - `outline.png`: 32x32 pixels, transparent outline icon
   
   Icon guidelines:
   - Use PNG format
   - Color icon should represent your brand
   - Outline icon should be simple, monochrome, with transparent background

3. **Package the App**:
   ```bash
   cd teams-app
   zip -r loi-bot.zip manifest.json color.png outline.png
   ```

## Installation

### Option 1: Upload to Teams (Development/Testing)

1. Open Microsoft Teams
2. Go to Apps → Manage your apps
3. Click "Upload an app" → "Upload a custom app"
4. Select the `loi-bot.zip` file
5. Add the bot to a team or group chat

### Option 2: Publish to Your Organization

1. Go to Teams Admin Center
2. Navigate to Teams apps → Manage apps
3. Click "Upload" and select `loi-bot.zip`
4. Review and approve the app
5. Users can now install from your organization's app catalog

### Option 3: Publish to Microsoft Store (Public)

1. Go to Partner Center (https://partner.microsoft.com/)
2. Create a Teams app submission
3. Upload the package and complete validation
4. Submit for review
5. Once approved, the app will be available in the Teams Store

## Manifest Reference

Key sections in `manifest.json`:

- **id**: Unique app identifier (GUID)
- **packageName**: Reverse domain notation (e.g., com.company.appname)
- **bots**: Bot configuration including commands and scopes
- **permissions**: Required permissions for the bot
- **validDomains**: Domains the bot can access
- **webApplicationInfo**: SSO configuration (optional)

## Testing

After uploading to Teams:

1. Add the bot to a group chat
2. Type `@LOI Bot help` to verify it's working
3. Have a conversation about a trade
4. Mention the bot to extract information
5. Test card interactions (Confirm, Edit, Save)

## Updating the App

When you make changes:

1. Update the `version` in manifest.json (follow semantic versioning)
2. Make your changes
3. Re-create the ZIP file
4. Re-upload to Teams (it will update the existing installation)

## Troubleshooting

**Bot not responding:**
- Verify Bot App ID in manifest matches Azure Bot Service
- Check bot messaging endpoint is configured correctly
- Ensure bot is running and accessible

**Can't upload app:**
- Verify manifest.json is valid JSON
- Check all required fields are filled
- Ensure icons are correct size and format

**Commands not showing:**
- Commands appear in the compose box when you @ mention the bot
- Check `commandLists` section in manifest is correct

## Resources

- [Teams App Manifest Schema](https://docs.microsoft.com/microsoftteams/platform/resources/schema/manifest-schema)
- [App Icon Guidelines](https://docs.microsoft.com/microsoftteams/platform/concepts/build-and-test/apps-package#app-icons)
- [Publishing Guide](https://docs.microsoft.com/microsoftteams/platform/concepts/deploy-and-publish/overview)

