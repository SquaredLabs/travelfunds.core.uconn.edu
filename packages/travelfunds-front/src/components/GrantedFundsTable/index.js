import React from 'react'
import { observable, computed, action } from 'mobx'
import { observer } from 'mobx-react'
import Fraction from 'fraction.js'
import { mapValues } from 'lodash'
import DollarInput from './DollarInput'
import RaisedButton from 'material-ui/RaisedButton'

import styles from './styles.scss'

const tableHeaders = [
  'Category',
  'Requested',
  'AAUP',
  'OVPR',
  'Granted'
]

const mapExpenseCategoryIdsToNames = {
  primary: 'Primary',
  secondary: 'Secondary',
  mileage: 'Mileage',
  registration: 'Registration',
  meals_and_lodging: 'Meals and Lodging'
}

const expenseCategoryIds = Object.keys(mapExpenseCategoryIdsToNames)

const sumObjectValues = obj =>
  Object.values(obj)
    .reduce((acc, x) => acc.add(x), new Fraction(0))

const minFraction = (...fractions) =>
  fractions.reduce((acc, x) =>
    acc.compare(x) <= 0 ? acc : x)

const maxFraction = (...fractions) =>
  fractions.reduce((acc, x) =>
    acc.compare(x) >= 0 ? acc : x)

// Only use this in render. Don't store JavaScript floating point numbers
// or risk precision loss.
const displayFraction = fraction =>
  fraction.valueOf().toFixed(2)

const sumAndDisplay = obj =>
  displayFraction(sumObjectValues(obj))

@observer
export default class GrantedFundsTable extends React.Component {
  blankStateObject = {
    AAUP: expenseCategoryIds.reduce((acc, id) =>
      ({ ...acc, [id]: new Fraction(0) }), {}),
    OVPR: expenseCategoryIds.reduce((acc, id) =>
      ({ ...acc, [id]: new Fraction(0) }), {})
  }

  @observable disabled = document.querySelector('input[value="Disbursed"]').checked

  // Transforming into Fraction objects allows us to preserve precision
  // when performing addition/subtraction
  @observable granted = this.props.mapBudgetsToExpenseCategoriesToGrantedCosts['AAUP']
    ? mapValues(this.props.mapBudgetsToExpenseCategoriesToGrantedCosts,
      x => mapValues(x, grantedCost => new Fraction(grantedCost)))
    : this.blankStateObject

  requestedAmounts = mapValues(this.props.mapExpenseCategoriesToRequestedAmounts,
    x => new Fraction(x))

  balancesBeforeGrants = mapValues(this.props.fundingBudgets,
    ({ balance, name }) =>
      (new Fraction(balance))
        // mapFundingBudgetToBalance from the backend includes grants from this
        // travel request. Add them here to avoid double counting later.
        // Note the lack of @observable or @computed since this subtraction
        // should only be done once.
        .add(sumObjectValues(this.granted[name])))

  @computed get balances () {
    return mapValues(
      this.balancesBeforeGrants,
      (balance, budget) => balance
        .sub(sumObjectValues(this.granted[budget])))
  }

  fairShareLeftBeforeGrants = (new Fraction(this.props.fairShareLeft))
    .add(Object.values(this.granted)
      .reduce((acc, x) => acc.add(sumObjectValues(x)), new Fraction(0)))

  @computed get fairShareLeft () {
    return this.fairShareLeftBeforeGrants
      .sub(Object.values(this.granted)
        .reduce((acc, x) => acc.add(sumObjectValues(x)), new Fraction(0)))
  }

  seniorFundsLeftBeforeGrants = mapValues(this.props.fundingBudgets,
    ({ seniorUsage, seniorUsageLimit, name }) =>
      (new Fraction(seniorUsageLimit)).sub(new Fraction(seniorUsage))
        .add(sumObjectValues(this.granted[name])))

  @computed get seniorFundsLeft () {
    return mapValues(this.seniorFundsLeftBeforeGrants,
      (amount, budget) => maxFraction(
        amount.sub(sumObjectValues(this.granted[budget])),
        // This shouldn't happen, but if the max senior allocation is ever
        // lowered, this number could be negative.
        new Fraction(0)))
  }

  constructor (props) {
    super(props)
    // Normally we would make the status radio buttons a React component and
    // pass in an onChange handler, but it would be a lot more work to invert
    // control from Laravel Backpack. It already does a good job enumerating
    // the possible enum values "status" can be.
    const statusButtons = document.querySelectorAll('input[name="status"]')
    for (const button of statusButtons) {
      button.addEventListener('change', () => {
        this.disabled = document.querySelector('input[value="Disbursed"]').checked
      })
    }
  }

  @action onGrantedFundChange (budget, expenseCategory, value) {
    this.granted[budget][expenseCategory] = value
  }

  @action clearGrantedFunds (ev) {
    if (ev) ev.preventDefault()
    this.granted = this.blankStateObject
  }

  @action autocalculate (ev) {
    ev.preventDefault()

    // Start with a clean slate. Fair share left will be different if there's
    // funds already entered.
    this.clearGrantedFunds()

    // Create a new object to store state so we can batch updates. Otherwise,
    // mutating the state object directly would trigger multiple unnecessary
    // rerenders.
    const pending = observable(this.blankStateObject)
    const requestedAmounts = this.requestedAmounts
    const fairShareLeft = this.fairShareLeft
    const seniorFundsLeft = this.seniorFundsLeft

    for (const expenseCategory of expenseCategoryIds) {
      const requestedAmount = requestedAmounts[expenseCategory]

      pending.AAUP[expenseCategory] = minFraction(...[
        requestedAmount,
        fairShareLeft.sub(sumObjectValues(pending.AAUP)),
        this.balancesBeforeGrants.AAUP.sub(sumObjectValues(pending.AAUP)),
        ...(this.props.traveler.isSenior
          ? [seniorFundsLeft.AAUP.sub(sumObjectValues(pending.AAUP))]
          : [])
      ])

      if (pending.AAUP[expenseCategory].compare(requestedAmount) < 0) {
        // This faculty has no more available AAUP funds. So we'll go to our
        // backup of using OVPR funds.
        pending.OVPR[expenseCategory] = minFraction(...[
          requestedAmount.sub(pending.AAUP[expenseCategory]),
          fairShareLeft
            .sub(sumObjectValues(pending.AAUP))
            .sub(sumObjectValues(pending.OVPR)),
          this.balancesBeforeGrants.OVPR.sub(sumObjectValues(pending.OVPR)),
          ...(this.props.traveler.isSenior
            ? [seniorFundsLeft.OVPR.sub(sumObjectValues(pending.OVPR))]
            : [])
        ])
      }
    }

    this.granted = pending
  }

  render () {
    const {
      mapExpenseCategoriesToRequestedCostIds,
      fundingBudgets
    } = this.props
    return <div className={styles.container}>
      <div className={styles.actionButtons}>
        <RaisedButton
          primary
          disabled={this.disabled}
          onClick={ev => this.clearGrantedFunds(ev)}
          label='Clear Granted Funds'
        />
        <RaisedButton
          primary
          disabled={this.disabled}
          onClick={ev => this.autocalculate(ev)}
          label='Autocalculate'
        />
      </div>
      <table className={styles.grantedFunds}>
        <thead>
          <tr>
            {tableHeaders.map(el => <th key={el}>{el}</th>)}
          </tr>
        </thead>
        <tbody>
          <ExpenseCategoryRows
            columns={this.granted}
            onGrantedFundChange={this.onGrantedFundChange.bind(this)}
            requestedAmounts={this.requestedAmounts}
            requestedCostIds={mapExpenseCategoriesToRequestedCostIds}
            fundingBudgets={fundingBudgets}
            disabled={this.disabled}
          />
        </tbody>
        <tfoot>
          <tr>
            <td>Total</td>
            <td>${sumAndDisplay(this.requestedAmounts)}</td>
            <td>${sumAndDisplay(this.granted.AAUP)}</td>
            <td>${sumAndDisplay(this.granted.OVPR)}</td>
            <td>
              ${displayFraction(
                sumObjectValues(this.granted.OVPR)
                  .add(sumObjectValues(this.granted.AAUP)))
              }
            </td>
          </tr>
          <tr>
            <td>Budget Balances</td>
            <td />
            <td>${displayFraction(this.balances.AAUP)}</td>
            <td>${displayFraction(this.balances.OVPR)}</td>
            <td />
          </tr>
          <tr>
            <td>Funds Left for Seniors</td>
            <td />
            {/* It may seem weird on the funding controller's end to see more
                senior funds left than the remaining balance, so we'll take the
                minimum to account for this. */}
            <td>
              ${displayFraction(minFraction(
                this.seniorFundsLeft.AAUP,
                this.balances.AAUP
              ))}
            </td>
            <td>
              ${displayFraction(minFraction(
                this.seniorFundsLeft.OVPR,
                this.balances.OVPR
              ))}
            </td>
            <td />
          </tr>
          <tr>
            <td>Fair Share Left</td>
            <td>${displayFraction(this.fairShareLeft)}</td>
            <td />
            <td />
            <td />
          </tr>
        </tfoot>
      </table>
    </div>
  }
}

const ExpenseCategoryRows = props =>
  expenseCategoryIds.map(category =>
    <tr key={category}>
      <td>{mapExpenseCategoryIdsToNames[category]}</td>
      <td>${displayFraction(props.requestedAmounts[category])}</td>
      <td>
        <DollarInput
          readOnly={props.disabled}
          name={[
            'requestedCosts',
            `[${props.requestedCostIds[category]}]`,
            `[grantedFundsByFundingBudget]`,
            `[${props.fundingBudgets.AAUP.id}]`
          ].join('')}
          value={props.columns.AAUP[category]}
          onChange={value => props.onGrantedFundChange('AAUP', category, value)}
        />
      </td>
      <td>
        <DollarInput
          readOnly={props.disabled}
          name={[
            'requestedCosts',
            `[${props.requestedCostIds[category]}]`,
            `[grantedFundsByFundingBudget]`,
            `[${props.fundingBudgets.OVPR.id}]`
          ].join('')}
          value={props.columns.OVPR[category]}
          onChange={value => props.onGrantedFundChange('OVPR', category, value)}
        />
      </td>
      <td>
        ${displayFraction(props.columns.AAUP[category]
          .add(props.columns.OVPR[category]))}
      </td>
    </tr>)
