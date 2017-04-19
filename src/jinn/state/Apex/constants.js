/*
 *
 * Apex constants
 *
 */

export const NAME = 'apex'
export const NON_ACTION_TYPE = '30px'

export const INITIAL_STATE = {
  data: null,
  error: null
}

const DEFAULT_ACTION = 'JINN/APEX/DEFAULT_ACTION'
const GET_DATA = 'JINN/APEX/DATA/GET'
const GET_DATA_SUCCESS = 'JINN/APEX/DATA/GET/SUCCESS'
const GET_DATA_FAILURE = 'JINN/APEX/DATA/GET/FAILURE'

export const actionTypes = {
  DEFAULT_ACTION,
  GET_DATA,
  GET_DATA_SUCCESS,
  GET_DATA_FAILURE
}