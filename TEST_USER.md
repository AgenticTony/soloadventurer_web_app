# Test User Credentials

## Authentication Test Account

You can use the following test credentials to sign in:

**Email:** `demo@soloadventurer.com`  
**Password:** `DemoPassword123!`  
**Name:** Demo User

## How to Test Authentication

1. **Go to:** http://localhost:3000/sign-in
2. **Enter credentials:**
   - Email: `test@soloadventurer.com`
   - Password: `TestPassword123!`
3. **Click "Sign in"**
4. **You should be redirected to:** http://localhost:3000/feed

## Expected Behavior

✅ **Successful Sign-in:**
- Shows "Signing in..." state
- Authenticates with AWS Cognito
- Redirects to `/feed` page
- Displays the full SoloAdventurer interface with 3-column layout

❌ **Error Cases:**
- Invalid credentials: Shows error message
- Network issues: Shows "Login failed" message
- Unconfirmed email: Shows confirmation error

## Troubleshooting

If authentication doesn't work:

1. **Check browser console** for error messages
2. **Verify server is running** at http://localhost:3000
3. **Check AWS Cognito** configuration in amplify_outputs.json
4. **Ensure .env.local** has correct AWS credentials

## Test Features Available

After successful authentication, you can:

- ✅ View the main feed with sample posts
- ✅ Use the PostComposer to create posts
- ✅ Interact with PostCard components (like, comment, share)
- ✅ Navigate using the 3-column layout
- ✅ Test keyboard navigation (J/K, /, C)
- ✅ View user profiles and trip cards
- ✅ Access all SoloAdventurer features

## Logout

To test logout:
- Click on your avatar in the top right
- Select logout option
- You'll be redirected back to `/sign-in`