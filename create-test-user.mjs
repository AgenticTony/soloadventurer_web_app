import { signUp } from 'aws-amplify/auth'
import { Amplify } from 'aws-amplify'
import outputs from './amplify_outputs.json' assert { type: 'json' }

Amplify.configure(outputs)

async function createTestUser() {
  try {
    console.log('Creating test user...')
    const { isSignUpComplete, userId } = await signUp({
      username: 'test@soloadventurer.com',
      password: 'TestPassword123!',
      options: {
        userAttributes: {
          email: 'test@soloadventurer.com',
          name: 'Test User'
        }
      }
    })
    console.log('Test user created:', { isSignUpComplete, userId })
    if (!isSignUpComplete) {
      console.log('User needs confirmation. Check email for confirmation code.')
    }
  } catch (error) {
    console.error('Error creating test user:', error.message)
    if (error.name === 'UsernameExistsException') {
      console.log('User already exists. Try signing in or resetting password.')
    }
  }
}

createTestUser()