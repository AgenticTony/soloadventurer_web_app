// Individual Conversation Page - Dynamic Route for Chat Conversations
// Sprint 3: Dynamic Chat Routes with Official Next.js App Router Patterns

import { redirect } from 'next/navigation';

interface ConversationPageProps {
  params: Promise<{ conversationId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

/**
 * Individual Conversation Page Component
 *
 * This page handles individual conversation routes like /chat/[conversationId]
 * Following Next.js App Router dynamic routing patterns, it redirects to the main
 * chat page with the conversation ID as a query parameter for better UX.
 *
 * This approach provides:
 * - Clean URLs for sharing conversations
 * - Better SEO for chat links
 * - Consistent state management through the main chat page
 * - Seamless mobile/desktop experience
 */
export default async function ConversationPage({
  params,
  searchParams,
}: ConversationPageProps) {
  // Await the params to get the conversationId
  const { conversationId } = await params;
  const search = await searchParams;

  // Validate conversationId format (basic validation)
  if (!conversationId || conversationId.length === 0) {
    redirect('/chat');
  }

  // Build the redirect URL with conversation query parameter
  const redirectUrl = new URL('/chat', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001');
  redirectUrl.searchParams.set('conversation', conversationId);

  // Preserve any additional search parameters
  Object.entries(search).forEach(([key, value]) => {
    if (typeof value === 'string') {
      redirectUrl.searchParams.set(key, value);
    } else if (Array.isArray(value)) {
      // Handle array values by taking the first one
      redirectUrl.searchParams.set(key, value[0]);
    }
  });

  // Redirect to main chat page with conversation selected
  redirect(redirectUrl.pathname + redirectUrl.search);
}

/**
 * Generate static params for common conversation routes
 * This can be extended to include frequently accessed conversations
 * for better performance in production
 */
export async function generateStaticParams() {
  // In a real application, you might fetch popular conversation IDs
  // from your database to pre-generate static pages
  return [
    // Example static params - replace with real data
    { conversationId: 'getting-started' },
    { conversationId: 'support' },
  ];
}

/**
 * Configure dynamic params handling
 * Set to true to allow dynamic conversation IDs not in generateStaticParams
 */
export const dynamicParams = true;

/**
 * Generate metadata for SEO and social sharing
 * This could be enhanced to fetch actual conversation data
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;

  // In a real application, fetch conversation details here
  // const conversation = await getConversation(conversationId);

  return {
    title: `Chat - Conversation ${conversationId}`,
    description: 'Join the conversation on SoloAdventurer',
    openGraph: {
      title: `Chat - Conversation ${conversationId}`,
      description: 'Join the conversation on SoloAdventurer',
      url: `/chat/${conversationId}`,
      siteName: 'SoloAdventurer',
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: `Chat - Conversation ${conversationId}`,
      description: 'Join the conversation on SoloAdventurer',
    },
    robots: {
      index: false, // Don't index individual chat pages for privacy
      follow: false,
    },
  };
}