import type { CSSProperties } from 'react'
import { orgs, type OrgKey } from '../content'

/** A company badge: the official logo if one is configured, otherwise a monogram. */
export default function OrgMark({ org, size }: { org: OrgKey; size?: number }) {
  const o = orgs[org]
  const style = { '--org': o.color, ...(size && { '--size': `${size}px` }) } as CSSProperties
  return (
    <span className={`org-mark ${o.logo ? 'has-logo' : ''}`} style={style} aria-hidden>
      {o.logo ? <img src={o.logo} alt="" /> : o.mono}
    </span>
  )
}
