import { fetchAuthSession } from 'aws-amplify/auth'

export async function checkAuthStatus(): Promise<boolean> {
  try {
    const session = await fetchAuthSession()
    return !!session.tokens?.idToken
  } catch (error) {
    return false
  }
}