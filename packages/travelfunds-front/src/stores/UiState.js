import { observable, action } from 'mobx'
import * as Cookies from 'js-cookie'

class UiState {
  authenticated = Cookies.get('user')
  @observable finished = false

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
