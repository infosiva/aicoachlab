import type { Role } from './types'

export const MOBILE_ENGINEER: Role = {
  slug: 'mobile-engineer',
  title: 'Mobile Engineer',
  blurb: 'Builds apps for iOS and Android that feel fast, work on poor connections and get through app store review.',
  asOf: '2026-10',
  demand: [],
  scenario: {
    title: 'Food delivery app with live order tracking',
    story:
      'A local restaurant group wants an iPhone and Android app where customers browse the menu, order, and watch their delivery. It must still open the menu on a weak connection and send a notification when the order is on its way.',
  },
  steps: [
    { stackId: 'platform', label: 'Choose the approach', happens: 'Decide between native apps and a cross-platform codebase based on the team and the features needed.' },
    { stackId: 'ui', label: 'Build screens', happens: 'Build the menu, cart and tracking screens with navigation and platform-appropriate design.' },
    { stackId: 'data', label: 'Network and offline', happens: 'Call the backend API, cache the menu on the device and queue actions that happen offline.' },
    { stackId: 'device', label: 'Use the device', happens: 'Ask for location and notification permission at the right moment and use them for tracking and alerts.' },
    { stackId: 'quality', label: 'Test and profile', happens: 'Test on real devices of different sizes, and profile startup time, memory and battery use.' },
    { stackId: 'release', label: 'Release', happens: 'Sign the build, ship through TestFlight and Play testing tracks, then submit for store review and roll out gradually.' },
  ],
  stack: [
    {
      id: 'platform', name: 'Native or cross-platform (Swift, Kotlin, React Native, Flutter)',
      what: 'The way the app is built: native Swift and Kotlin, or one shared codebase with React Native or Flutter.',
      why: 'A small team shipping to both platforms often shares code, while deep device features favour native.',
      mustKnow: ['Tradeoffs of shared code versus native control', 'Platform design guidelines differ on iOS and Android', 'Know when you must drop to native code'],
      mistake: 'Choosing a framework from a trend without checking that it supports the device features you need.',
    },
    {
      id: 'ui', name: 'UI toolkit and navigation (SwiftUI, Jetpack Compose)',
      what: 'The declarative UI frameworks for each platform, plus navigation between screens.',
      why: 'Screens built from small state-driven views are easier to change and test than hand-managed layouts.',
      mustKnow: ['State drives the UI, not manual updates', 'Layouts must adapt to screen sizes and text scaling', 'Support dark mode and accessibility labels'],
      mistake: 'Building only for one phone size and breaking on small screens or large text.',
    },
    {
      id: 'data', name: 'Networking, local storage and offline',
      what: 'Calling APIs, storing data on the device with SQLite-based storage, and syncing when the connection returns.',
      why: 'Phones lose signal often, so the menu must open from the cache and orders must not be lost.',
      mustKnow: ['Handle timeouts, retries and no-network states', 'Cache what the user needs most and show stale data clearly', 'Store tokens in the Keychain or Keystore, not plain storage'],
      mistake: 'Assuming the network is always available and showing a blank screen when it is not.',
    },
    {
      id: 'device', name: 'Permissions, push notifications and background work',
      what: 'Access to device features such as location and camera, push notifications through APNs and FCM, and limited background tasks.',
      why: 'Order tracking relies on timely notifications and location, and users can say no to either.',
      mustKnow: ['Ask for permission in context and handle denial', 'Push needs a server component and valid tokens', 'The OS limits background work to save battery'],
      mistake: 'Requesting every permission on first launch, so users deny them all.',
    },
    {
      id: 'quality', name: 'Testing, profiling and crash reporting',
      what: 'Unit and UI tests, tests on real devices, profilers in Xcode and Android Studio, and crash reporting such as Firebase Crashlytics or Sentry.',
      why: 'A crash or slow start on one device model costs reviews, and you cannot reproduce it without data.',
      mustKnow: ['Test on old and low-end devices, not only the newest', 'Measure cold start, memory and battery', 'Read crash reports and group them by cause'],
      mistake: 'Testing only in the simulator on a fast laptop.',
    },
    {
      id: 'release', name: 'Signing, store release and versioning',
      what: 'Code signing, build pipelines, beta distribution and submission to the App Store and Google Play.',
      why: 'A rejected or broken release delays every fix, and you cannot force users to update.',
      mustKnow: ['Manage certificates and keys safely', 'Follow store review guidelines and privacy disclosures', 'Use staged rollouts and keep older app versions working with the API'],
      mistake: 'Changing the API in a way that crashes users still on the previous app version.',
    },
  ],
}
