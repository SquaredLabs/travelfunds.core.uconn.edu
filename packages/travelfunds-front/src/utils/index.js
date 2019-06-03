import { guidelinesUrl } from '../consts'
export function linkifyGuidelines (msg) {
  // What? Did someone say guidelines? Link! Link! Link!
  return msg.replace('guidelines', `<a target="_blank" rel="noopener noreferrer" href="${guidelinesUrl}">guidelines</a>`)
}

export { default as inDateRange } from './in-date-range'
