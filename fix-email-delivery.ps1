# PowerShell Script to Fix Email Delivery Issue
# This script creates an Application Access Policy to restrict your Graph API app
# to only send emails as admin@wabcomobility.com

Write-Host "=== Wabco Mobility Email Delivery Fix ===" -ForegroundColor Green
Write-Host "This script will create an Application Access Policy for your Microsoft Graph app"
Write-Host ""

# Step 1: Connect to Exchange Online
Write-Host "Step 1: Connecting to Exchange Online PowerShell..." -ForegroundColor Yellow
try {
    Import-Module ExchangeOnlineManagement -Force
    Connect-ExchangeOnline -ShowProgress $true
    Write-Host "✅ Successfully connected to Exchange Online" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to connect to Exchange Online: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 2: Get your App Client ID
Write-Host ""
Write-Host "Step 2: Enter your Azure App Registration details" -ForegroundColor Yellow
$AppClientId = Read-Host "Please enter your App Client ID (from Azure App Registration)"

if (-not $AppClientId) {
    Write-Host "❌ App Client ID is required. Exiting." -ForegroundColor Red
    exit 1
}

# Step 3: Create a mail-enabled security group for senders (if it doesn't exist)
Write-Host ""
Write-Host "Step 3: Creating mail-enabled security group for authorized senders..." -ForegroundColor Yellow

$GroupName = "WabcoMobilitySenders"
$GroupEmail = "senders@wabcomobility.com"

try {
    # Check if group already exists
    $existingGroup = Get-DistributionGroup -Identity $GroupName -ErrorAction SilentlyContinue
    
    if ($existingGroup) {
        Write-Host "✅ Group '$GroupName' already exists" -ForegroundColor Green
    } else {
        # Create the group
        New-DistributionGroup -Name $GroupName -PrimarySmtpAddress $GroupEmail -Type "Security" -Members "admin@wabcomobility.com"
        Write-Host "✅ Created security group '$GroupName' with email '$GroupEmail'" -ForegroundColor Green
    }
    
    # Add admin@wabcomobility.com to the group (in case it's not already there)
    Add-DistributionGroupMember -Identity $GroupName -Member "admin@wabcomobility.com" -ErrorAction SilentlyContinue
    Write-Host "✅ Added admin@wabcomobility.com to the group" -ForegroundColor Green
    
} catch {
    Write-Host "⚠️  Warning: Could not create/modify group: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "You may need to create the group manually or use an existing one" -ForegroundColor Yellow
    $GroupEmail = Read-Host "Please enter the email of an existing mail-enabled security group (or press Enter to use admin@wabcomobility.com directly)"
    if (-not $GroupEmail) {
        $GroupEmail = "admin@wabcomobility.com"
    }
}

# Step 4: Create the Application Access Policy
Write-Host ""
Write-Host "Step 4: Creating Application Access Policy..." -ForegroundColor Yellow

try {
    # Remove any existing policy for this app (optional cleanup)
    $existingPolicy = Get-ApplicationAccessPolicy -AppId $AppClientId -ErrorAction SilentlyContinue
    if ($existingPolicy) {
        Write-Host "Removing existing policy for app..." -ForegroundColor Yellow
        Remove-ApplicationAccessPolicy -AppId $AppClientId -Confirm:$false
    }
    
    # Create the new policy
    New-ApplicationAccessPolicy -AppId $AppClientId -PolicyScopeGroupId $GroupEmail -AccessRight RestrictAccess -Description "Allow Graph API app to send as admin@wabcomobility.com - Wabco Mobility"
    
    Write-Host "✅ Successfully created Application Access Policy!" -ForegroundColor Green
    Write-Host "   App ID: $AppClientId" -ForegroundColor Cyan
    Write-Host "   Scope: $GroupEmail" -ForegroundColor Cyan
    Write-Host "   Access: RestrictAccess" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ Failed to create Application Access Policy: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Manual command to try:" -ForegroundColor Yellow
    Write-Host "New-ApplicationAccessPolicy -AppId '$AppClientId' -PolicyScopeGroupId '$GroupEmail' -AccessRight RestrictAccess -Description 'Allow Graph API app to send as admin@wabcomobility.com'" -ForegroundColor Cyan
}

# Step 5: Test the policy
Write-Host ""
Write-Host "Step 5: Testing the Application Access Policy..." -ForegroundColor Yellow

try {
    $policy = Get-ApplicationAccessPolicy -AppId $AppClientId
    if ($policy) {
        Write-Host "✅ Policy verified successfully!" -ForegroundColor Green
        Write-Host "Policy Details:" -ForegroundColor Cyan
        $policy | Format-List
    }
} catch {
    Write-Host "⚠️  Could not verify policy: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Step 6: Test email access
Write-Host ""
Write-Host "Step 6: Testing email access for your app..." -ForegroundColor Yellow

try {
    Test-ApplicationAccessPolicy -Identity "admin@wabcomobility.com" -AppId $AppClientId
    Write-Host "✅ Email access test completed! Check the output above for results." -ForegroundColor Green
} catch {
    Write-Host "⚠️  Could not test email access: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== Next Steps ===" -ForegroundColor Green
Write-Host "1. Wait 15-30 minutes for the policy to propagate across Microsoft's systems"
Write-Host "2. Test your application's email sending functionality"
Write-Host "3. Check your application logs for any remaining errors"
Write-Host "4. If issues persist, verify your Azure app has the correct permissions:"
Write-Host "   - Mail.Send (Application permission)"
Write-Host "   - Admin consent granted"
Write-Host ""
Write-Host "5. Alternative: Consider using a dedicated email service like SendGrid or Resend"
Write-Host ""

# Disconnect from Exchange Online
Write-Host "Disconnecting from Exchange Online..." -ForegroundColor Yellow
Disconnect-ExchangeOnline -Confirm:$false

Write-Host "✅ Script completed successfully!" -ForegroundColor Green 