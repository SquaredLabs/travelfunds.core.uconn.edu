export function linkifyGuidelines (msg) {
  // What? Did someone say guidelines? Link! Link! Link!
  return msg.replace('guidelines', '<a target="_blank" rel="noopener noreferrer" href="http://research.uconn.edu/funding/faculty-travel/">guidelines</a>')
}
