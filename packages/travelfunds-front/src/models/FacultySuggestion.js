export default class FacultySuggestion {
  netid
  firstName
  lastName

  constructor (args) {
    Object.assign(this, args)
  }

  toString () {
    return `${this.firstName} ${this.lastName} (${this.netid})`
  }

  static fromPayload (payload) {
    return new FacultySuggestion({
      netid: payload.netid,
      firstName: payload.first_name,
      lastName: payload.last_name
    })
  }
}
