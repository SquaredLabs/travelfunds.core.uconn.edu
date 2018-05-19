import React from 'react'
import { inject, observer } from 'mobx-react'
import { CSSTransitionGroup } from 'react-transition-group'
import cn from 'classnames'

import CircularProgress from 'material-ui/CircularProgress'

import { linkifyGuidelines } from 'utils'

import styles from './styles.scss'

export default class extends React.Component {
  render () {
    const { children, className, sidebarTitle, sidebarContent, ...rest } = this.props

    return <div className={cn(className, styles.container)}>
      <Sidebar title={sidebarTitle}>{sidebarContent}</Sidebar>
      <div {...rest} className={styles.card}>{children}</div>
      <ProgressOverlay />
    </div>
  }
}

@inject('FormState') @observer
class Sidebar extends React.Component {
  render () {
    const { FormState } = this.props

    const sidebarContent = Array.isArray(FormState.sidebarContent)
      ? FormState.sidebarContent.map(msg =>
        <p key={msg} dangerouslySetInnerHTML={{ __html: linkifyGuidelines(msg) }} />)
      : <p dangerouslySetInnerHTML={{ __html: linkifyGuidelines(FormState.sidebarContent) }} />

    return <aside className={styles.sidebar}>
      <CSSTransitionGroup
        transitionName='fadeInReplace'
        transitionEnterTimeout={500}
        transitionLeaveTimeout={1}
      >
        <div key={FormState.sidebarTitle} className={styles.sidebarContent}>
          <h2>{FormState.sidebarTitle}</h2>
          {sidebarContent}
        </div>
      </CSSTransitionGroup>
    </aside>
  }
}

@inject('TransportState') @observer
class ProgressOverlay extends React.Component {
  render () {
    const { TransportState: { isSendingTravelRequest } } = this.props

    return (
      <CSSTransitionGroup
        className={cn(
          styles.progressOverlayContainer,
          { [styles.progressActive]: isSendingTravelRequest }
        )}
        transitionName='progressOverlay'
        transitionEnterTimeout={100}
        transitionLeaveTimeout={100}
      >
        { isSendingTravelRequest && (<div className={styles.progressOverlay}>
          <CircularProgress />
        </div>) }
      </CSSTransitionGroup>
    )
  }
}
