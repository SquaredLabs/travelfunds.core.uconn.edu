import React from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'
import AdminLayout from 'containers/AdminLayout'
import TravelRequests from 'pages/Admin/TravelRequests'
import TravelRequestEdit from 'pages/Admin/TravelRequests/Edit'
import EmailLog from 'pages/Admin/EmailLog'
import Budgets from 'pages/Admin/Budgets'
import BudgetsForFiscalYear from 'pages/Admin/Budgets/FiscalYear'

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
          <Route exact path='/admin/budgets' component={Budgets} />
          <Route path='/admin/budgets/:year' component={BudgetsForFiscalYear} />
        </Switch>
      </AdminLayout>
    </div>
  }
}
