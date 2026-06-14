import { OtherUserProfile } from './OtherUserProfile'

interface ProfilePageProps {
  params: Promise<{ username: string }>
}

// Server component: await Next 15's params promise, then hand the plain
// username string to the client component (avoids React 18's missing `use()`).
export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params
  return <OtherUserProfile username={username} />
}
