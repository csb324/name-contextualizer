import { useEffect, useRef } from 'react'

// Replace these once AdSense approves the site:
//   PUBLISHER_ID → your ca-pub-XXXXXXXXXXXXXXXX
//   slot         → the ad unit slot ID from the AdSense dashboard
const PUBLISHER_ID = 'ca-pub-1812016008004987'

export default function AdUnit({ slot = '7098193754' }) {
  const pushed = useRef(false)

  useEffect(() => {
    if (pushed.current) return
    pushed.current = true
    try {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch {
      // AdSense script not loaded yet (dev / pre-approval)
    }
  }, [])

  return (
    <div className="ad-unit">
      <span className="ad-label">Advertisement</span>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={PUBLISHER_ID}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  )
}
