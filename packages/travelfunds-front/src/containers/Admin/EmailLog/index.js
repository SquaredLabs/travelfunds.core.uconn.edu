import React from 'react'
import { observable, action, computed, runInAction } from 'mobx'
import { observer } from 'mobx-react'
import fetch from 'isomorphic-fetch'
import { format } from 'date-fns'
import ExpansionPanel from '@material-ui/core/ExpansionPanel'
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary'
import TablePagination from '@material-ui/core/TablePagination'
import Icon from '@material-ui/core/Icon'

import styles from './styles.scss'

@observer
class EmailLog extends React.Component {
  @observable emails = []
  @observable page = 0
  @observable rowsPerPage = 15

  @action async fetchEmails () {
    const res = await fetch('/api/emails', { credentials: 'include' })
    const json = await res.json()
    this.emails = json
      .map(x => ({ ...x, html: null }))
      .sort((a, b) => a.id < b.id ? 1 : -1)
  }

  @action async fetchEmail (id) {
    const email = this.emails.find(x => x.id === id)
    if (email.html) return

    const res = await fetch(`/api/emails/${id}/html`, { credentials: 'include' })
    const text = await res.text()
    runInAction(() => {
      console.log(text)
      email.html = text
    })
  }

  @computed get visibleEmails () {
    return this.emails.slice(
      this.page * this.rowsPerPage,
      (this.page + 1) * this.rowsPerPage
    )
  }

  componentDidMount () {
    this.fetchEmails()
  }

  render () {
    return <div>
      { this.visibleEmails.map(email =>
        <EmailExpansionPanel
          key={email.id}
          email={email}
          onClick={() => this.fetchEmail(email.id)}
        />
      )}
      <TablePagination
        component='div'
        onChangePage={(_, page) => { this.page = page }}
        onChangeRowsPerPage={ev => { this.rowsPerPage = ev.target.value }}
        page={this.page}
        rowsPerPage={this.rowsPerPage}
        rowsPerPageOptions={[15, 50, 100]}
        count={this.emails.length}
      />
    </div>
  }
}

@observer
class EmailExpansionPanel extends React.Component {
  render () {
    console.log('emailexpansionpanel')
    const { email, onClick } = this.props
    return <ExpansionPanel key={email.id} onClick={onClick}>
      <ExpansionPanelSummary
        className={styles.summary}
        expandIcon={<Icon>expand_more</Icon>}>
        {email.subject}
        <span className={styles.emailDate}>
          {format(email.createdAt, 'MMM Do, YYYY - h:mma')}
        </span>
      </ExpansionPanelSummary>
      <div
        className={styles.emailContainer}
        dangerouslySetInnerHTML={{ __html: email.html }}
      />
    </ExpansionPanel>
  }
}

export default EmailLog
