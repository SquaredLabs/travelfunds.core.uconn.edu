import React from 'react'
import TransitionGroup from 'react-transition-group/TransitionGroup'
import cn from 'classnames'

import styles from './styles.scss'

/*
 * Accordion animates the entry of a single component.
 */

export const Accordion = ({ children, className, ...props }) => (
  <TransitionGroup component='div' {...props} className={cn(styles.container, className)}>
    { children !== null && React.Children.only(children) }
  </TransitionGroup>
)

export class AccordionChild extends React.Component {
  componentWillEnter (cb) {
    const { transitionDuration } = this.props

    const originalHeight = this.container.clientHeight

    window.requestAnimationFrame(() => {
      this.container.style.height = '0'
      this.container.style.transition = `height ${transitionDuration}ms`

      window.requestAnimationFrame(() => {
        this.container.style.height = `${originalHeight}px`

        setTimeout(() => {
          this.container.style.height = ''
          this.container.style.transition = ''
          cb()
        }, transitionDuration)
      })
    })
  }

  render () {
    const { children } = this.props

    return <div ref={r => { this.container = r }}>
      {children}
    </div>
  }
}

AccordionChild.defaultProps = {
  transitionDuration: '300' // in ms
}
