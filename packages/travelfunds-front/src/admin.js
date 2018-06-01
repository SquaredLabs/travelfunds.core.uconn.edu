import React from 'react'
import ReactDOM from 'react-dom'
import GrantedFundsTable from 'components/GrantedFundsTable'

const App = () =>
  <GrantedFundsTable {...window.editRequestedFunds} />

ReactDOM.render(<App />, document.getElementById('grant-costs-control'))
