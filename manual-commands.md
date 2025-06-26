# Manual Commands to Fix Email Delivery Issue

## Prerequisites
1. You must be a **Global Administrator** or **Exchange Administrator** in your Microsoft 365 tenant
2. You need your **Azure App Registration Client ID**
3. Run these commands in **PowerShell as Administrator**

## Step 1: Connect to Exchange Online
```powershell
# Install Exchange Online PowerShell module (if not already installed)
Install-Module -Name ExchangeOnlineManagement -Force

# Import the module
Import-Module ExchangeOnlineManagement

# Connect to Exchange Online (you'll be prompted to authenticate)
Connect-ExchangeOnline
```

## Step 2: Create Application Access Policy

Replace `<your-app-client-id>` with your actual Azure App Registration Client ID:

```powershell
# Option 1: Using a mail-enabled security group (recommended)
New-ApplicationAccessPolicy -AppId "<your-app-client-id>" -PolicyScopeGroupId "senders@wabcomobility.com" -AccessRight RestrictAccess -Description "Allow Graph API app to send as admin@wabcomobility.com"

# Option 2: If the group doesn't exist, use the admin email directly
New-ApplicationAccessPolicy -AppId "<your-app-client-id>" -PolicyScopeGroupId "admin@wabcomobility.com" -AccessRight RestrictAccess -Description "Allow Graph API app to send as admin@wabcomobility.com"
```

## Step 3: Create the Mail-Enabled Security Group (if needed)

If you want to use Option 1 above but don't have the group, create it first:

```powershell
# Create a mail-enabled security group
New-DistributionGroup -Name "WabcoMobilitySenders" -PrimarySmtpAddress "senders@wabcomobility.com" -Type "Security" -Members "admin@wabcomobility.com"
```

## Step 4: Verify the Policy

```powershell
# Check if the policy was created successfully
Get-ApplicationAccessPolicy -AppId "<your-app-client-id>"

# Test the policy
Test-ApplicationAccessPolicy -Identity "admin@wabcomobility.com" -AppId "<your-app-client-id>"
```

## Step 5: Disconnect

```powershell
Disconnect-ExchangeOnline
```

## Your Original Command (Exact)

Based on your request, here's the exact command you wanted to run:

```powershell
New-ApplicationAccessPolicy -AppId <your-app-client-id> -PolicyScopeGroupId senders@wabcomobility.com -AccessRight RestrictAccess -Description "Allow Graph API app to send as admin@wabcomobility.com"
```

**Important Notes:**
- Replace `<your-app-client-id>` with your actual Client ID (GUID format)
- The email `senders@wabcomobility.com` must be a valid mail-enabled security group
- If the group doesn't exist, create it first or use `admin@wabcomobility.com` directly
- Allow 15-30 minutes for the policy to propagate

## Alternative: Find Your Client ID

If you need to find your Client ID, you can check:
1. Azure Portal > App Registrations > Your App > Overview > Application (client) ID
2. Or check your application's environment variables where it's stored as `CLIENT_ID` 