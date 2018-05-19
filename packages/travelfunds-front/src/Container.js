import React from 'react'
import { inject, observer } from 'mobx-react'

import UConnBanner from 'components/UConnBanner'
import TallAppBar from 'components/TallAppBar'
import Footer from 'components/Footer'

import 'styles/global.scss'
import styles from './styles/container.scss'

// TODO: This import will be present in the production bundle. For a fully
// dynamic import, see https://webpack.js.org/guides/code-splitting-async/
import DevTools from 'mobx-react-devtools'
const inDevelopment = process.env.NODE_ENV !== 'production'

@inject('UiState') @observer
export default class extends React.Component {
  render () {
    const { UiState: { currentPage: Page } } = this.props

    return <div className={styles.root}>
      { inDevelopment && <DevTools /> }
      <UConnBanner />
      <TallAppBar title='Faculty Travel Funding' showMenuIconButton={false} />
      <main className={styles.main}>
        <Page />
      </main>
      <Footer />
    </div>
  }
}
