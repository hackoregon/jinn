/*
 *
 * Form constants
 *
 */

export const NAME = 'form'
export const NON_ACTION_TYPE = '30px'

export const INITIAL_STATE = {
  data: null,
  error: null
}

const DEFAULT_ACTION = '/FORM/DEFAULT_ACTION'
const GET_DATA = '/FORM/DATA/GET'
const GET_DATA_SUCCESS = '/FORM/DATA/GET/SUCCESS'
const GET_DATA_FAILURE = '/FORM/DATA/GET/FAILURE'

export const actionTypes = {
  DEFAULT_ACTION,
  GET_DATA,
  GET_DATA_SUCCESS,
  GET_DATA_FAILURE
}