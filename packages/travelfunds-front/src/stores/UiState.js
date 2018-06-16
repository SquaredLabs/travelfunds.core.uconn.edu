import { observable, action, computed } from 'mobx'
import * as Cookies from 'js-cookie'

import Login from 'pages/Login'
import TravelRequestForm from 'pages/TravelRequestForm'
import Finished from 'pages/Finished'

class UiState {
  authenticated = Cookies.get('user')
  @observable finished = false

  @action redirectToFinishedPage () {
    this.finished = true
  }

  @computed get rootPage () {
    if (this.finished) {
      return Finished
    } else if (this.authenticated) {
      return TravelRequestForm
    } else {
      return Login
    }
  }

  @observable snackbarOpen = false

  @observable snackbarQueue = []

  @action processSnackbarQueue () {
    this.snackbarQueue.shift()
    if (this.snackbarQueue.length > 0) {
      this.snackbarOpen = true
    }
  }

  @action addSnackbarMessage (message, type = 'info') {
    this.snackbarQueue.push({ key: new Date(), type, message })
    this.snackbarOpen = true
  }
}

const singleton = new UiState()
export default singleton
