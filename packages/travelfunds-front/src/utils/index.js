/*
 * This is a modified version of the .toISODate polyfill from MDN to only return
 * the date. This is used instead of moment.js since moment adds about 200 Kb to
 * bundle.js when we only need it for the below.
 *
 * The return value is an ISO 8601 date string.
 */
export function toISODateString (date) {
  function pad (number) {
    if (number < 10) {
      return '0' + number
    }
    return number
  }

  return date.getUTCFullYear() +
    '-' + pad(date.getUTCMonth() + 1) +
    '-' + pad(date.getUTCDate())
}

export function linkifyGuidelines (msg) {
  // What? Did someone say guidelines? Link! Link! Link!
  return msg.replace('guidelines', '<a target="_blank" rel="noopener noreferrer" href="http://research.uconn.edu/funding/faculty-travel/">guidelines</a>')
}
