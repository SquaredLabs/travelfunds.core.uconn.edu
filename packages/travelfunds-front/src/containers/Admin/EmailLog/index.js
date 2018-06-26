import React from 'react'
import { observable, action, computed } from 'mobx'
import { observer } from 'mobx-react'
import { format } from 'date-fns'
import ExpansionPanel from '@material-ui/core/ExpansionPanel'
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary'
import TablePagination from '@material-ui/core/TablePagination'
import Icon from '@material-ui/core/Icon'
import IconButton from '@material-ui/core/IconButton'
import CircularProgress from '@material-ui/core/CircularProgress'
import TextField from '@material-ui/core/TextField'
import { getAll, getHTML } from 'transport/email'

import styles from './styles.scss'

@observer
class EmailLog extends React.Component {
  @observable fetching = false
  @observable emails = []
  @observable page = 0
  @observable rowsPerPage = 15
  @observable searchText = ''

  @action async fetchEmails () {
    this.fetching = true
    try {
      var json = await getAll()
    } finally {
      this.fetching = false
    }
    this.emails = json
      .map(x => ({ ...x, html: null }))
      .sort((a, b) => a.id < b.id ? 1 : -1)
  }

  @action async fetchEmail (id) {
    const email = this.emails.find(x => x.id === id)
    if (email.html) return
    email.html = await getHTML(id)
  }

  @computed get filtered () {
    const searchText = this.searchText.trim()
    return this.emails
      .filter(x =>
        x.subject.toLowerCase().indexOf(searchText.toLowerCase()) !== -1)
  }

  @computed get getCurrentPage () {
    return this.filtered.slice(
      this.page * this.rowsPerPage,
      (this.page + 1) * this.rowsPerPage
    )
  }

  componentDidMount () {
    this.fetchEmails()
  }

  render () {
    return <div>
      <div className={styles.searchField}>
        <TextField
          label='Search emails by title'
          value={this.searchText}
          onChange={ev => { this.searchText = ev.target.value }}
        />
      </div>
      { this.fetching && <CircularProgress className={styles.progress} /> }
      { this.getCurrentPage.map(email =>
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
        count={this.filtered.length}
      />
    </div>
  }
}

@observer
class EmailExpansionPanel extends React.Component {
  render () {
    const { email, onClick } = this.props
    return <ExpansionPanel key={email.id} onClick={onClick}>
      <ExpansionPanelSummary
        className={styles.summary}
        expandIcon={<Icon>expand_more</Icon>}>
        {email.subject}
        <IconButton
          className={styles.linkButton}
          href={`/api/emails/${email.id}/html`}
          target='_blank'>
          <Icon>link</Icon>
        </IconButton>
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
