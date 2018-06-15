import React from 'react'

export default ({ trip }) =>
  <div>
    <h1>Travel Request {trip.id}</h1>
    <dl>
      <dt>Name</dt><dd>{trip.firstName} {trip.lastName}</dd>
      <dt>NetID</dt><dd>{trip.netid}</dd>
      <dt>Department</dt><dd>{trip.department}</dd>
      <dt>Title</dt><dd>{trip.title}</dd>
    </dl>
  </div>
