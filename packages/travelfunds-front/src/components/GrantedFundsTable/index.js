import React from 'react'
import { observable, computed, action, autorun } from 'mobx'
import { observer } from 'mobx-react'
import Fraction from 'fraction.js'
import { flatten } from 'lodash'
import DollarInput from './DollarInput'
import Button from '@material-ui/core/Button'

import styles from './styles.scss'

const sumObjectValues = obj =>
  Object.values(obj)
    .reduce((acc, x) => acc.add(x), new Fraction(0))

const minFraction = (...fractions) =>
  fractions.reduce((acc, x) =>
    acc.compare(x) <= 0 ? acc : x)

const maxFraction = (...fractions) =>
  fractions.reduce((acc, x) =>
    acc.compare(x) > 0 ? acc : x)

// Only use this in render. Don't store JavaScript floating point numbers
// or risk precision loss.
const displayFraction = fraction =>
  fraction.valueOf().toFixed(2)

export default
@observer
class GrantedFundsTable extends React.Component {
  @observable disabled = this.props.trip.status === 'Disbursed'

  @observable trip = {
    ...this.props.trip,
    Costs: this.props.trip.Costs.map(cost => ({
      ...cost,
      amount: new Fraction(cost.amount)
    }))
  }

  @computed get budgets () {
    return this.props.budgets.map(budget => {
      const getGrantedTotal = costs => costs
        .map(cost => cost.Grants)
        .reduce((acc, el) => [...acc, ...el])
        .filter(x => x.BudgetId === budget.id)
        .map(x =>
          x.amount instanceof Fraction
            ? x.amount
            : new Fraction(x.amount))
        .reduce((acc, x) => acc.add(x), new Fraction(0))

      // mapFundingBudgetToBalance from the backend includes grants from this
      // travel request. Add them here to avoid double counting later.
      const onLoadGranted = getGrantedTotal(this.props.trip.Costs)
      const granted = getGrantedTotal(this.trip.Costs)
      const balance = new Fraction(budget.balance)
        .add(onLoadGranted)
        .sub(granted)

      const seniorFundsLeft = this.trip.isForSenior
        ? new Fraction(budget.seniorFundsLeft)
          .add(onLoadGranted)
          .sub(granted)
        : new Fraction(budget.seniorFundsLeft)

      return { ...budget, balance, seniorFundsLeft }
    }).sort((a, b) => a.id < b.id ? -1 : 1)
  }

  @computed get fairShareLeft () {
    const getGrantedTotal = costs => costs
      .map(cost => cost.Grants)
      .reduce((acc, el) => [...acc, ...el])
      .map(grant => new Fraction(grant.amount))
      .reduce((acc, x) => acc.add(x), new Fraction(0))

    return new Fraction(this.props.fairShareLeft)
      .add(getGrantedTotal(this.props.trip.Costs))
      .sub(getGrantedTotal(this.trip.Costs))
  }

  @computed get usableBudgets () {
    // TODO: Ask for a better way to distinguish law professors
    const isLawProfessor = this.trip.department.startsWith('Law')
    const attendanceOnly = this.trip.participationLevel === 'Attendance Only'

    return this.budgets
      .filter(budget => !(!budget.usableByLawProfessors && isLawProfessor))
      .filter(budget => !(!budget.usableForAttendanceOnly && attendanceOnly))
  }

  tableHeaders = [
    'Category',
    'Requested',
    ...this.budgets.map(budget => `${budget.name} ${budget.FundingPeriod.name}`),
    'Granted'
  ]

  @action onGrantedFundChange (costId, budgetId, value) {
    const cost = this.trip.Costs.find(cost => cost.id === costId)
    const existingGrant = cost.Grants.find(grant => grant.BudgetId === budgetId)
    if (existingGrant) {
      existingGrant.amount = new Fraction(value)
    } else {
      cost.Grants.push({
        amount: new Fraction(value),
        BudgetId: budgetId,
        CostId: costId
      })
    }
  }

  @action clearGrantedFunds () {
    for (const cost of this.trip.Costs) {
      cost.Grants = []
    }
  }

  @action autocalculate () {
    // Start with a clean slate. Fair share left will be different if there's
    // funds already entered.
    this.clearGrantedFunds()

    for (const cost of this.trip.Costs) {
      for (const budget of this.usableBudgets) {
        const awarded = sumObjectValues(cost.Grants.map(x => x.amount))

        const amount = minFraction(
          cost.amount.sub(awarded),
          budget.balance,
          this.fairShareLeft,
          ...this.trip.isForSenior
            ? [maxFraction(new Fraction(0), budget.seniorFundsLeft)]
            : []
        )

        cost.Grants.push({ amount, CostId: cost.id, BudgetId: budget.id })
      }
    }
  }

  componentWillMount (props) {
    this.grantsAutorun = autorun(() => {
      this.props.onGrantsChange(
        this.trip.Costs
          .map(x => x.Grants)
          .reduce((acc, el) => [...acc, ...el]))
    })
  }

  componentWillUnmount () {
    this.grantsAutorun()
  }

  render () {
    return <div className={styles.container}>
      <div className={styles.actionButtons}>
        <Button
          variant='outlined'
          disabled={this.disabled}
          onClick={ev => this.clearGrantedFunds(ev)}
          children='Clear Granted Funds'
        />
        <Button
          variant='outlined'
          color='primary'
          disabled={this.disabled}
          onClick={ev => this.autocalculate(ev)}
          children='Autocalculate'
        />
      </div>
      <table className={styles.grantedFunds}>
        <thead>
          <tr>
            {this.tableHeaders.map(el => <th key={el}>{el}</th>)}
          </tr>
        </thead>
        <tbody>
          <ExpenseCategoryRows
            onGrantedFundChange={(...args) => this.onGrantedFundChange(...args)}
            trip={this.trip}
            budgets={this.budgets}
            disabled={this.disabled}
          />
        </tbody>
        <TableFooter
          trip={this.trip}
          budgets={[...this.budgets]}
          fairShareLeft={this.fairShareLeft}
        />
      </table>
    </div>
  }
}

@observer
class ExpenseCategoryRows extends React.Component {
  inputField (cost, budget) {
    const existingGrant = cost.Grants
      .find(granted => granted.BudgetId === budget.id)

    return <td key={budget.id}>
      <DollarInput
        readOnly={this.props.disabled}
        name={cost.id}
        value={existingGrant ? existingGrant.amount : new Fraction(0)}
        onChange={value => this.props.onGrantedFundChange(cost.id, budget.id, value)}
      />
    </td>
  }

  totalForRequest (cost) {
    return cost.Grants.reduce(
      (acc, grant) => acc.add(grant.amount),
      new Fraction(0))
  }

  render () {
    const props = this.props
    return props.trip.Costs.map(cost =>
      <tr key={cost.expenseCategory}>
        <td>{cost.expenseCategory}</td>
        <td>${displayFraction(cost.amount)}</td>
        {props.budgets.map(budget => this.inputField(cost, budget))}
        <td>${displayFraction(this.totalForRequest(cost))}</td>
      </tr>)
  }
}

@observer
class TableFooter extends React.Component {
  render () {
    const { trip, budgets, fairShareLeft } = this.props
    return <tfoot>
      <tr>
        <td>Total</td>
        <td>
          ${displayFraction(trip.Costs.reduce((acc, cost) =>
            acc.add(cost.amount), new Fraction(0)))}
        </td>
        {budgets.map(budget =>
          <td key={budget.id}>
            ${displayFraction(flatten(trip.Costs.map(cost => [...cost.Grants]))
              .filter(grant => grant.BudgetId === budget.id)
              .reduce((acc, grant) => acc.add(grant.amount), new Fraction(0)))}
          </td>)}
        <td>
          ${displayFraction(flatten(trip.Costs.map(cost => [...cost.Grants]))
            .reduce((acc, grant) => acc.add(grant.amount), new Fraction(0)))}
        </td>
      </tr>
      <tr>
        <td>Budget Balances</td>
        <td />
        {budgets.map(budget =>
          <td key={budget.id}>
            ${displayFraction(budget.balance)}
          </td>)}
        <td />
      </tr>
      <tr>
        <td>Funds Left for Seniors</td>
        <td />
        {/* It may seem weird on the funding controller's end to see more
            senior funds left than the remaining balance, so we'll take the
            minimum to account for this. */}
        {budgets.map(budget =>
          <td key={budget.id}>
            ${displayFraction(minFraction(
              budget.seniorFundsLeft,
              budget.balance
            ))}
          </td>)}
        <td />
      </tr>
      <tr>
        <td>Fair Share Left</td>
        <td>${displayFraction(fairShareLeft)}</td>
        <td />
        <td />
        <td />
      </tr>
    </tfoot>
  }
}
