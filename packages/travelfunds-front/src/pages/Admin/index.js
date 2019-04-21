import React from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'
import AdminLayout from 'containers/AdminLayout'
import TravelRequests from 'containers/Admin/TravelRequests'
import TravelRequestEdit from 'containers/Admin/TravelRequestEdit'
import EmailLog from 'containers/Admin/EmailLog'
import FundingPeriods from 'containers/Admin/FundingPeriods'

import DevTools from 'mobx-react-devtools'
const inDevelopment = process.env.NODE_ENV !== 'production'

export default class extends React.Component {
  render () {
    return <div>
      { inDevelopment && <DevTools /> }
      <AdminLayout>
        <Switch>
          <Route exact path='/admin' render={() => <Redirect to='/admin/trips' />} />
          <Route exact path='/admin/trips' component={TravelRequests} />
          <Route path='/admin/trips/:id' component={TravelRequestEdit} />
          <Route exact path='/admin/emails' component={EmailLog} />
          <Route exact path='/admin/funding-periods' component={FundingPeriods} />
        </Switch>
      </AdminLayout>
    </div>
  }
}
