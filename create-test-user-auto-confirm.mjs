import { signUp, confirmSignUp } from 'aws-amplify/auth'
import { Amplify } from 'aws-amplify'
import outputs from './amplify_outputs.json' assert { type: 'json' }

Amplify.configure(outputs)

async function createAndConfirmTestUser() {
  try {
    console.log('Creating demo user...')
    const { isSignUpComplete, userId, nextStep } = await signUp({
      username: 'demo@soloadventurer.com',
      password: 'DemoPassword123!',
      options: {
        userAttributes: {
          email: 'demo@soloadventurer.com',
          name: 'Demo User'
        }
      }
    })
    
    console.log('Sign up result:', { isSignUpComplete, userId, nextStep })
    
    if (!isSignUpComplete && nextStep.signUpStep === 'CONFIRM_SIGN_UP') {
      console.log('User needs confirmation...')
      
      // Try to confirm with a common test code
      try {
        const { isSignUpComplete: confirmationComplete } = await confirmSignUp({
          username: 'demo@soloadventurer.com',
          confirmationCode: '123456' // Common test code
        })
        
        if (confirmationComplete) {
          console.log('✅ Test user confirmed successfully!')
          console.log('You can now sign in with:')
          console.log('Email: demo@soloadventurer.com')
          console.log('Password: DemoPassword123!')
        } else {
          console.log('❌ Confirmation failed')
        }
      } catch (confirmError) {
        console.log('Auto-confirmation failed. You may need to:')
        console.log('1. Check your email for confirmation code')
        console.log('2. Or use AWS Cognito console to confirm the user')
        console.log('3. Or update Cognito settings to auto-confirm users')
      }
    } else if (isSignUpComplete) {
      console.log('✅ Demo user created and confirmed successfully!')
      console.log('You can now sign in with:')
      console.log('Email: demo@soloadventurer.com')
      console.log('Password: DemoPassword123!')
    }
  } catch (error) {
    console.error('Error:', error.message)
    if (error.name === 'UsernameExistsException') {
      console.log('User already exists. Try signing in.')
    }
  }
}

createAndConfirmTestUser()