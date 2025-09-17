import { cookies } from 'next/headers'
import { createServerRunner } from '@aws-amplify/adapter-nextjs'
import { getCurrentUser } from 'aws-amplify/auth/server'
import { fetchAuthSession } from 'aws-amplify/auth/server'
import outputs from '../../amplify_outputs.json'

export const { runWithAmplifyServerContext } = createServerRunner({
  config: outputs,
})

export async function getCurrentUserServer() {
  try {
    const currentUser = await runWithAmplifyServerContext({
      nextServerContext: { cookies },
      operation: (contextSpec) => getCurrentUser(contextSpec),
    })
    return currentUser
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

export async function getAuthSessionServer() {
  try {
    const session = await runWithAmplifyServerContext({
      nextServerContext: { cookies },
      operation: (contextSpec) => fetchAuthSession(contextSpec, {}),
    })
    return session
  } catch (error) {
    console.error('Error getting auth session:', error)
    return null
  }
}

export async function isAuthenticatedServer() {
  try {
    const session = await getAuthSessionServer()
    const currentUser = await getCurrentUserServer()
    
    // Only return true if we have both valid tokens AND a current user
    return session?.tokens !== undefined && currentUser !== null
  } catch (error) {
    console.error('Error checking authentication:', error)
    return false
  }
}