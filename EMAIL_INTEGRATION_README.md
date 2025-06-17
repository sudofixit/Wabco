# Email Integration - Microsoft Graph API

## Overview
This implementation adds email functionality to the Wabco Mobility tire and service booking system using Microsoft Graph API with Client Credentials Flow authentication.

## Features
- ✅ **Tire Booking Confirmations** - Automatic emails for tire bookings
- ✅ **Tire Quotation Confirmations** - Automatic emails for tire quotation requests  
- ✅ **Service Booking Confirmations** - Automatic emails for service bookings
- ✅ **Service Quotation Confirmations** - Automatic emails for service quotation requests
- ✅ **Admin Notifications** - Admin receives notifications for all tire and service requests
- ✅ **Reference Numbers** - WM-XXXXXX for bookings, QT-XXXXXX for quotations
- ✅ **Environment-based Configuration** - Different behavior for dev/prod
- ✅ **Test Endpoint** - `/api/test-email` for verification
- ✅ **Error Handling** - Comprehensive logging and graceful failures

## Required Environment Variables

Add these to your `.env` file:

```env
# Microsoft Graph API Configuration
TENANT_ID="your-azure-tenant-id"
CLIENT_ID="your-azure-app-client-id" 
CLIENT_SECRET="your-azure-app-client-secret"
SENDER_EMAIL="admin@wabcomobility.com"

# Optional Email Configuration
TEST_EMAIL="admin@wabcomobility.com"  # Only used for /api/test-email endpoint
SKIP_EMAILS="false"  # Set to "true" to disable email sending in dev
```

## Azure App Registration Setup

1. **Register Application** in Azure Portal
2. **API Permissions** - Add `Mail.Send` (Application permission)
3. **Grant Admin Consent** for the permissions
4. **Create Client Secret** and copy the values
5. **Note down** Tenant ID and Client ID

## File Structure

```
lib/
  emailService.ts          # Main email service utility
app/api/
  test-email/route.ts      # Test endpoint for verification
  bookings/route.ts        # Updated with email integration
```

## How It Works

### 1. Email Service (`lib/emailService.ts`)
- **Authentication**: Client Credentials Flow with Microsoft Graph
- **Email Templates**: HTML templates for customer and admin emails
- **Async Sending**: Fire-and-forget email sending (doesn't block API responses)
- **Environment Handling**: Different behavior for dev/prod environments

### 2. Integration Points
- **Tire Bookings**: Triggered after successful tire booking creation
- **Tire Quotations**: Triggered after successful tire quotation creation
- **Service Bookings**: Triggered after successful service booking creation
- **Service Quotations**: Triggered after successful service quotation creation
- **Admin Notifications**: Sent to `SENDER_EMAIL` for all tire and service requests

### 3. Email Content
**Customer Emails Include:**
- Reference number (WM-XXXXXX or QT-XXXXXX)
- **For Tire Bookings**: Tire details (brand, pattern, size), quantity
- **For Service Bookings**: Service names, vehicle details (year, make, model)
- Branch information (name, address, phone)
- Date/time (for bookings only)

**Admin Emails Include:**
- All customer information
- Request type and source (tire or service)
- Customer contact details

## Testing

### 1. Test Email Endpoint
```bash
# Check endpoint status
curl http://localhost:3000/api/test-email

# Send test email
curl -X POST http://localhost:3000/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"testEmail":"your-email@example.com"}'
```

### 2. Integration Test Script
```bash
node test-email-integration.js
```

### 3. Manual Testing
1. Create a tire booking through the UI
2. Create a service booking through the UI  
3. Check server logs for email sending status
4. Verify emails are received (customer + admin)

## Environment Behavior

### Development Mode
- **Customer emails**: Sent to **actual customer email address** (same as production)
- **Admin emails**: Sent to `SENDER_EMAIL` (admin@wabcomobility.com)
- **Test endpoint**: Uses `TEST_EMAIL` when explicitly testing via `/api/test-email`
- Can be disabled with `SKIP_EMAILS=true`
- Console logging for debugging

### Production Mode  
- **Customer emails**: Sent to **actual customer email address**
- **Admin emails**: Sent to `SENDER_EMAIL` (admin@wabcomobility.com)
- Error logging only

### Important Note
📧 **Customer confirmation emails ALWAYS go to the real customer email** (`customerEmail` from booking data) in both development and production environments. 

🧪 **TEST_EMAIL is ONLY used** for the `/api/test-email` endpoint when explicitly testing the email service functionality.

## Error Handling

- **Authentication Failures**: Logged with detailed error messages
- **Email Send Failures**: Logged but don't fail the booking process
- **Missing Configuration**: Service gracefully handles missing env vars
- **Network Issues**: Retry not implemented (fire-and-forget approach)

## Reference Number Format

- **Bookings**: `WM-000001`, `WM-000002`, etc.
- **Quotations**: `QT-000001`, `QT-000002`, etc.
- Based on booking ID with zero-padding

## Limitations & Future Enhancements

### Current Limitations
- No retry mechanism for failed emails
- No email queue system
- Console logging only (no database logging)
- Simple HTML templates (no advanced styling)

### Planned Enhancements
- ✅ **Service booking email integration** - COMPLETED
- Advanced email templates with branding
- Email delivery status tracking
- Retry mechanism for failed sends
- Separate admin email configuration

## Troubleshooting

### Common Issues

1. **"Missing environment variables"**
   - Ensure all required env vars are set in `.env`
   - Restart development server after adding variables

2. **"Token request failed"**
   - Check Azure app registration configuration
   - Verify client secret hasn't expired
   - Ensure API permissions are granted

3. **"Send mail failed"**
   - Check sender email has proper mailbox setup
   - Verify Graph API permissions
   - Check network connectivity

4. **Emails not received**
   - Check spam/junk folders
   - Verify email addresses are correct
   - Check server logs for sending status

### Debug Steps
1. Check `/api/test-email` endpoint status
2. Review server console logs
3. Test with known working email address
4. Verify Azure app permissions

## Support

For issues or questions about the email integration:
1. Check server logs for detailed error messages
2. Test with `/api/test-email` endpoint
3. Verify Azure configuration
4. Review environment variables 