import { createSelector } from 'reselect'

/**
 * Direct selector to the apex  state
 */
const selectApex = () => state => state.apex

/**
 * Other specific selectors
 */

/**
 * Default selector used by Apex
 */

const makeSelectApex = () => createSelector(
  selectApex(),
  (substate) => substate
)

export default makeSelectApex
export {
  selectApex
}
