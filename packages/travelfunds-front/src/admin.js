import React from 'react'
import ReactDOM from 'react-dom'
import GrantedFundsTable from 'components/GrantedFundsTable'

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'

const App = () =>
  <MuiThemeProvider>
    <GrantedFundsTable {...window.editRequestedFunds} />
  </MuiThemeProvider>

ReactDOM.render(<App />, document.getElementById('grant-costs-control'))
