import React from 'react'
import { inject, observer } from 'mobx-react'
import { format, parseISO } from 'date-fns'
import ExpansionPanel from '@material-ui/core/ExpansionPanel'
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary'
import TablePagination from '@material-ui/core/TablePagination'
import Icon from '@material-ui/core/Icon'
import IconButton from '@material-ui/core/IconButton'
import CircularProgress from '@material-ui/core/CircularProgress'
import TextField from '@material-ui/core/TextField'

import styles from './styles.scss'

@inject('EmailLogStore') @observer
class EmailLog extends React.Component {
  componentDidMount () {
    this.props.EmailLogStore.fetchEmails()
  }

  render () {
    const { EmailLogStore } = this.props
    return <div>
      <div className={styles.searchField}>
        <TextField
          label='Search emails by title'
          value={EmailLogStore.searchText}
          onChange={ev => { EmailLogStore.searchText = ev.target.value }}
        />
      </div>
      { EmailLogStore.fetching && <CircularProgress className={styles.progress} /> }
      { EmailLogStore.currentPage.map(email =>
        <EmailExpansionPanel
          key={email.id}
          email={email}
          onClick={() => EmailLogStore.fetchEmail(email.id)}
        />
      )}
      <TablePagination
        component='div'
        onChangePage={(_, page) => { EmailLogStore.page = page }}
        onChangeRowsPerPage={ev => { EmailLogStore.rowsPerPage = ev.target.value }}
        page={EmailLogStore.page}
        rowsPerPage={EmailLogStore.rowsPerPage}
        rowsPerPageOptions={[15, 50, 100]}
        count={EmailLogStore.filtered.length}
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
          {format(parseISO(email.createdAt), 'MMM do, yyyy - h:mma')}
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
