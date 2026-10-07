// app/page.tsx — SERVER COMPONENT wrapper
// Fetches feature flags from Edge Config and passes them to the client page.
import { getSiteFlags } from '@/lib/flags'
import { ROLES } from '@/lib/roles'
import AICoachLabPage from './AICoachLabPage'

export default async function Page() {
  const flags = await getSiteFlags('aicoachlab')
  return <AICoachLabPage showPricing={flags.pricing} roles={ROLES.map(({ slug, title }) => ({ slug, title }))} />
}
