import React from 'react'
import { inject } from 'mobx-react'

import lang from 'lang/en_US.js'

/*
 * This component automatically sets the sidebar title and content based on the
 * current field.
 */

@inject('FormState')
export default class extends React.Component {
  updateSidebar () {
    const { FormState, floatingLabelText, sidebarTextId } = this.props
    if (sidebarTextId && floatingLabelText) {
      FormState.sidebarTitle = floatingLabelText
      FormState.sidebarContent = lang.tooltips[sidebarTextId]
    }
  }

  onFocus (...args) {
    this.updateSidebar()
    this.props.onFocus && this.props.onFocus(...args)
  }

  onClick (...args) {
    this.updateSidebar()
    this.props.onClick && this.props.onClick(...args)
  }

  render () {
    const { FormState, component: Component, sidebarTextId, ...rest } = this.props
    const onFocus = (...args) => this.onFocus(...args)
    const onClick = (...args) => this.onClick(...args)
    return <Component {...{ ...rest, onFocus, onClick }} />
  }
}
