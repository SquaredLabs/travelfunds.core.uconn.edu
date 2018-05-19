import { observable, action } from 'mobx'

import Login from 'pages/Login'
import TravelRequestForm from 'pages/TravelRequestForm'
import Finished from 'pages/Finished'

class UiState {
  // We'll use MobX as a simple router for now. Install React Router when this
  // gets more complicated.
  @observable.ref currentPage = window.login
    ? TravelRequestForm
    : Login

  @action redirectToFinishedPage () {
    this.currentPage = Finished
  }
}

const singleton = new UiState()
export default singleton
