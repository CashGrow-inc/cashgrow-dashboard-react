# CashGrow Frontend Authentication Guide

This guide explains how the email verification and password reset pages work in the CashGrow frontend.

## Overview

Two new authentication pages have been added:
1. **Email Verification** (`/verify-email?token=xxx`)
2. **Password Reset** (`/reset-password?token=xxx`)

These pages integrate with the backend authentication API to handle email verification and password reset flows.

## Components

### 1. VerifyEmailScreen.tsx

**Location:** `components/VerifyEmailScreen.tsx`

**Purpose:** Verifies user email addresses using tokens from verification emails.

**Features:**
- Automatically extracts token from URL query parameters
- Calls `/api/auth/verify-email` endpoint
- Shows loading, success, and error states
- Allows resending verification email if token expired
- Auto-redirects to login after successful verification (3 seconds)

**URL Format:**
```
https://www.cashgrow.net/verify-email?token=abc123def456...
```

### 2. ResetPasswordScreen.tsx

**Location:** `components/ResetPasswordScreen.tsx`

**Purpose:** Allows users to reset their password using tokens from password reset emails.

**Features:**
- Extracts token from URL query parameters
- Password strength validation (real-time feedback)
- Password requirements display
- Show/hide password toggle
- Confirmation password matching
- Calls `/api/auth/reset-password` endpoint
- Auto-redirects to login after successful reset (3 seconds)

**URL Format:**
```
https://www.cashgrow.net/reset-password?token=xyz789abc123...
```

## How It Works

### App.tsx Integration

The main App.tsx has been updated to handle routing for these pages:

1. **URL Detection:** On component mount, the app checks the URL:
   ```typescript
   useEffect(() => {
     const path = window.location.pathname;
     const searchParams = new URLSearchParams(window.location.search);

     if (path.includes('/verify-email') || searchParams.has('verify-email')) {
       setShowVerifyEmail(true);
     } else if (path.includes('/reset-password') || searchParams.has('reset-password')) {
       setShowResetPassword(true);
     }
   }, []);
   ```

2. **Conditional Rendering:** Pages are shown based on URL state:
   ```typescript
   if (showVerifyEmail) {
     return <VerifyEmailScreen onVerificationComplete={handleVerificationComplete} />;
   }

   if (showResetPassword) {
     return <ResetPasswordScreen onResetComplete={handleResetComplete} />;
   }
   ```

3. **Clean URL After Completion:** After verification/reset, the URL is cleaned:
   ```typescript
   window.history.replaceState({}, '', '/');
   ```

## User Flows

### Email Verification Flow

1. User registers account
2. Backend sends verification email with link:
   ```
   https://www.cashgrow.net/verify-email?token=abc123
   ```
3. User clicks link → Opens `VerifyEmailScreen`
4. Component extracts token from URL
5. Calls `POST /api/auth/verify-email` with token
6. Shows success message
7. Auto-redirects to login after 3 seconds

**If token is expired/invalid:**
- User can enter email address
- Clicks "Resend Verification Email"
- Calls `POST /api/auth/resend-verification`
- New verification email sent

### Password Reset Flow

1. User clicks "Forgot Password" (on login screen)
2. Backend sends password reset email with link:
   ```
   https://www.cashgrow.net/reset-password?token=xyz789
   ```
3. User clicks link → Opens `ResetPasswordScreen`
4. Component extracts token from URL
5. User enters new password (with validation)
6. User confirms password
7. Calls `POST /api/auth/reset-password` with token and new password
8. Shows success message
9. Auto-redirects to login after 3 seconds

## Password Requirements

The password must meet these requirements:
- **At least 8 characters long**
- **At least one uppercase letter**
- **At least one digit**

These requirements are:
- Validated in real-time as user types
- Displayed with checkmarks as requirements are met
- Enforced on form submission

## API Integration

### Base URL
```typescript
const API_BASE_URL = 'https://cashgrow-new-backend-python-production.up.railway.app/api';
```

### Endpoints Used

1. **Verify Email:**
   ```typescript
   POST ${API_BASE_URL}/auth/verify-email
   Body: { token: string }
   ```

2. **Resend Verification:**
   ```typescript
   POST ${API_BASE_URL}/auth/resend-verification
   Body: { email: string }
   ```

3. **Reset Password:**
   ```typescript
   POST ${API_BASE_URL}/auth/reset-password
   Body: { token: string, new_password: string }
   ```

## Error Handling

Both components handle errors gracefully:

### VerifyEmailScreen Errors:
- **No token in URL:** Shows error + allows manual resend
- **Invalid/expired token:** Shows error + resend form
- **Network errors:** Shows generic error message

### ResetPasswordScreen Errors:
- **No token in URL:** Shows error + back to login button
- **Invalid/expired token:** Shows error from API
- **Password validation errors:** Shows inline validation messages
- **Passwords don't match:** Shows inline error
- **Network errors:** Shows error message

## Styling

Both screens use:
- **Gradient background:** `bg-gradient-to-br from-blue-50 via-white to-green-50`
- **Rounded cards:** `rounded-3xl shadow-xl`
- **CashGrow branding:** Logo component from `WelcomeScreen`
- **Consistent colors:**
  - Primary: `blue-600` / `blue-700`
  - Success: `green-600` / `green-100`
  - Error: `red-600` / `red-50`
  - Text: `slate-800` / `slate-600` / `slate-500`

## Testing

### Test Email Verification:

1. Start frontend: `npm run dev`
2. Navigate to: `http://localhost:3000/verify-email?token=test123`
3. Should see verification screen
4. Will fail with "invalid token" (expected)
5. Can test resend form

### Test Password Reset:

1. Navigate to: `http://localhost:3000/reset-password?token=test123`
2. Should see reset password screen
3. Enter new password
4. Test password validation (real-time feedback)
5. Test password confirmation
6. Will fail with "invalid token" (expected)

### Test Full Flow:

1. Use backend to register a new user
2. Check email for verification link
3. Click verification link
4. Should see success and redirect to login
5. Request password reset
6. Check email for reset link
7. Click reset link
8. Enter new password
9. Should see success and redirect to login
10. Login with new password

## URL Routing Options

The app supports both path-based and query-based routing:

**Path-based:**
```
https://www.cashgrow.net/verify-email?token=xxx
https://www.cashgrow.net/reset-password?token=xxx
```

**Query-based (alternative):**
```
https://www.cashgrow.net/?verify-email&token=xxx
https://www.cashgrow.net/?reset-password&token=xxx
```

Both formats work because the detection checks for both:
```typescript
if (path.includes('/verify-email') || searchParams.has('verify-email'))
```

## Next Steps

### For Production Deployment:

1. **Update API Base URL:** Change in both components:
   ```typescript
   const API_BASE_URL = 'https://your-production-api.com/api';
   ```

2. **Configure Netlify Redirects:** Add to `netlify.toml`:
   ```toml
   [[redirects]]
     from = "/verify-email"
     to = "/index.html"
     status = 200

   [[redirects]]
     from = "/reset-password"
     to = "/index.html"
     status = 200
   ```

3. **Test Email Links:** Ensure backend sends correct production URLs

4. **Update Backend FRONTEND_URL:** In backend `.env`:
   ```
   FRONTEND_URL=https://www.cashgrow.net
   ```

## Troubleshooting

### "No verification token found"
- Check URL has `?token=xxx` parameter
- Ensure email link is correctly formatted

### "Token expired"
- Use resend verification feature
- Tokens expire after 24 hours (verification) or 30 minutes (reset)

### "Password validation failed"
- Ensure password meets all requirements (8+ chars, uppercase, digit)
- Check passwords match in both fields

### Not redirecting after success
- Check console for errors
- Ensure `onVerificationComplete` / `onResetComplete` props are passed
- Default redirect delay is 3 seconds

## Files Modified

- ✅ `components/VerifyEmailScreen.tsx` (new)
- ✅ `components/ResetPasswordScreen.tsx` (new)
- ✅ `App.tsx` (updated with routing logic)

## Dependencies

No new dependencies required! Uses existing:
- `axios` - API calls
- `react` - Component framework
- Tailwind CSS - Styling
