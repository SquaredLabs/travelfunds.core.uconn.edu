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
    Costs: this.props.trip.Costs
      .map(cost => ({
        ...cost,
        amount: new Fraction(cost.amount)
      }))
      .sort((a, b) => a.id < b.id ? -1 : 1)
  }

  @computed get budgetAllocations () {
    return this.props.budgetAllocations.map(budgetAllocation => {
      const getGrantedTotal = costs => costs
        .map(cost => cost.Grants)
        .reduce((acc, el) => [...acc, ...el])
        .filter(x => x.BudgetAllocationId === budgetAllocation.id)
        .map(x =>
          x.amount instanceof Fraction
            ? x.amount
            : new Fraction(x.amount))
        .reduce((acc, x) => acc.add(x), new Fraction(0))

      const onLoadGranted = getGrantedTotal(this.props.trip.Costs)
      const granted = getGrantedTotal(this.trip.Costs)

      // If this travel request has non-zero grants, then budget balances from
      // the API include these grants. Add them here to avoid double counting
      // later.
      const balance = new Fraction(budgetAllocation.balance)
        .add(onLoadGranted)
        .sub(granted)

      const seniorFundsLeft = this.trip.isForSenior
        ? new Fraction(budgetAllocation.seniorFundsLeft)
          .add(onLoadGranted)
          .sub(granted)
        : new Fraction(budgetAllocation.seniorFundsLeft)

      return { ...budgetAllocation, balance, seniorFundsLeft }
    }).sort((a, b) => a.BudgetId < b.BudgetId ? -1 : 1)
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

  @computed get usableBudgetAllocations () {
    // TODO: Ask for a better way to distinguish law professors
    const isLawProfessor = this.trip.department.startsWith('Law')
    const attendanceOnly = this.trip.participationLevel === 'Attendance Only'

    return this.budgetAllocations
      .filter(budgetAllocation =>
        !(!budgetAllocation.Budget.usableByLawProfessors && isLawProfessor))
      .filter(budgetAllocation =>
        !(!budgetAllocation.Budget.usableForAttendanceOnly && attendanceOnly))
  }

  tableHeaders = [
    'Category',
    'Requested',
    ...this.budgetAllocations
      .map(budgetAllocation => budgetAllocation.Budget)
      .map(budget => `${budget.name} ${budget.fiscalYear}`),
    'Granted'
  ]

  @action onGrantedFundChange (costId, budgetAllocationId, value) {
    const cost = this.trip.Costs.find(cost => cost.id === costId)
    const existingGrant = cost.Grants.find(grant =>
      grant.BudgetAllocationId === budgetAllocationId)
    if (existingGrant) {
      existingGrant.amount = new Fraction(value)
    } else {
      cost.Grants.push({
        amount: new Fraction(value),
        BudgetAllocationId: budgetAllocationId,
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
      for (const budgetAllocation of this.usableBudgetAllocations) {
        const awarded = sumObjectValues(cost.Grants.map(x => x.amount))

        const amount = minFraction(
          cost.amount.sub(awarded),
          budgetAllocation.balance,
          this.fairShareLeft,
          ...this.trip.isForSenior
            ? [maxFraction(new Fraction(0), budgetAllocation.seniorFundsLeft)]
            : []
        )

        cost.Grants.push({
          amount,
          CostId: cost.id,
          BudgetAllocationId: budgetAllocation.id
        })
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
            budgetAllocations={this.budgetAllocations}
            disabled={this.disabled}
          />
        </tbody>
        <TableFooter
          trip={this.trip}
          budgetAllocations={[...this.budgetAllocations]}
          fairShareLeft={this.fairShareLeft}
        />
      </table>
    </div>
  }
}

@observer
class ExpenseCategoryRows extends React.Component {
  inputField (cost, budgetAllocation) {
    const existingGrant = cost.Grants
      .find(granted => granted.BudgetAllocationId === budgetAllocation.id)

    return <td key={budgetAllocation.id}>
      <DollarInput
        readOnly={this.props.disabled}
        name={cost.id}
        value={existingGrant ? existingGrant.amount : new Fraction(0)}
        onChange={value =>
          this.props.onGrantedFundChange(cost.id, budgetAllocation.id, value)}
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
        {props.budgetAllocations.map(budgetAllocation =>
          this.inputField(cost, budgetAllocation))}
        <td>${displayFraction(this.totalForRequest(cost))}</td>
      </tr>)
  }
}

@observer
class TableFooter extends React.Component {
  render () {
    const { trip, budgetAllocations, fairShareLeft } = this.props
    return <tfoot>
      <tr>
        <td>Total</td>
        <td>
          ${displayFraction(trip.Costs.reduce((acc, cost) =>
            acc.add(cost.amount), new Fraction(0)))}
        </td>
        {budgetAllocations.map(budgetAllocation =>
          <td key={budgetAllocation.id}>
            ${displayFraction(flatten(trip.Costs.map(cost => [...cost.Grants]))
              .filter(grant => grant.BudgetAllocationId === budgetAllocation.id)
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
        {budgetAllocations.map(budgetAllocation =>
          <td key={budgetAllocation.id}>
            ${displayFraction(budgetAllocation.balance)}
          </td>)}
        <td />
      </tr>
      <tr>
        <td>Funds Left for Seniors</td>
        <td />
        {budgetAllocations.map(budgetAllocation =>
          <td key={budgetAllocation.id}>
            ${displayFraction(budgetAllocation.seniorFundsLeft)}
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
