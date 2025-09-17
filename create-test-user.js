const { signUp } = require('./src/contexts/AuthContext.tsx');

async function createTestUser() {
  try {
    const result = await signUp('test@soloadventurer.com', 'TestPassword123!', 'Test User');
    console.log('Test user created:', result);
    
    if (!result.userConfirmed) {
      console.log('User needs to confirm email. Check your email for confirmation code.');
    }
  } catch (error) {
    console.error('Error creating test user:', error);
  }
}

createTestUser();