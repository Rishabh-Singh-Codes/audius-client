import {
  IntKeys,
  accountSelectors,
  walletActions,
  doEvery,
  waitForValue
} from '@audius/common'
import { each } from 'lodash'
import moment from 'moment'
import { all, call, put, take, takeEvery, getContext } from 'redux-saga/effects'

import { retrieveUserTracks } from 'common/store/pages/profile/lineups/tracks/retrieveUserTracks'
import { requiresAccount } from 'common/utils/requiresAccount'
import { DASHBOARD_PAGE } from 'utils/route'
import { waitForRead } from 'utils/sagaHelpers'

import * as dashboardActions from './actions'
const { getBalance } = walletActions
const getAccountUser = accountSelectors.getAccountUser

function* fetchDashboardTracksAsync(action) {
  const account = yield call(waitForValue, getAccountUser)
  const { offset, limit } = action

  try {
    const tracks = yield call(retrieveUserTracks, {
      handle: account.handle,
      currentUserId: account.user_id,
      offset,
      limit,
      getUnlisted: true
    })
    const listedTracks = tracks.filter((t) => t.is_unlisted === false)
    const unlistedTracks = tracks.filter((t) => t.is_unlisted === true)

    yield put(
      dashboardActions.fetchDashboardTracksSucceeded(
        listedTracks,
        unlistedTracks
      )
    )
  } catch (error) {
    console.error(error)
    yield put(dashboardActions.fetchDashboardTracksFailed())
  }
}

function* fetchDashboardAsync(action) {
  const audiusBackendInstance = yield getContext('audiusBackendInstance')
  yield call(waitForRead)

  const account = yield call(waitForValue, getAccountUser)
  const { offset, limit } = action

  try {
    const [tracks, playlists] = yield all([
      call(retrieveUserTracks, {
        handle: account.handle,
        currentUserId: account.user_id,
        offset,
        limit,
        getUnlisted: true
      }),
      call(audiusBackendInstance.getPlaylists, account.user_id, [])
    ])
    const listedTracks = tracks.filter((t) => t.is_unlisted === false)
    const unlistedTracks = tracks.filter((t) => t.is_unlisted === true)

    const trackIds = listedTracks.map((t) => t.track_id)
    const now = moment()

    yield call(fetchDashboardListenDataAsync, {
      trackIds,
      start: now.clone().subtract(1, 'years').toISOString(),
      end: now.toISOString(),
      period: 'month'
    })

    if (
      listedTracks.length > 0 ||
      playlists.length > 0 ||
      unlistedTracks.length > 0
    ) {
      yield put(
        dashboardActions.fetchDashboardSucceeded(
          listedTracks,
          playlists,
          unlistedTracks
        )
      )
      yield call(pollForBalance)
    } else {
      yield put(dashboardActions.fetchDashboardFailed())
    }
  } catch (error) {
    console.error(error)
    yield put(dashboardActions.fetchDashboardFailed())
  }
}

const formatMonth = (date) => moment.utc(date).format('MMM').toUpperCase()

function* fetchDashboardListenDataAsync(action) {
  const audiusBackendInstance = yield getContext('audiusBackendInstance')
  const account = yield call(waitForValue, getAccountUser)
  const listenData = yield call(
    audiusBackendInstance.getUserListenCountsMonthly,
    account.user_id,
    action.start,
    action.end
  )
  const labels = []
  const labelIndexMap = {}
  const startDate = moment.utc(action.start)
  const endDate = moment.utc(action.end)
  while (startDate.isBefore(endDate)) {
    startDate.add(1, 'month').endOf('month')
    const label = formatMonth(startDate)
    labelIndexMap[label] = labels.length
    labels.push(label)
  }

  const formattedListenData = {
    all: {
      labels: [...labels],
      values: new Array(labels.length).fill(0)
    }
  }
  each(listenData, (data, date) => {
    formattedListenData.all.values[labelIndexMap[formatMonth(date)]] =
      data.totalListens
    data.listenCounts.forEach((count) => {
      if (!(count.trackId in formattedListenData)) {
        formattedListenData[count.trackId] = {
          labels: [...labels],
          values: new Array(labels.length).fill(0)
        }
      }
      formattedListenData[count.trackId].values[
        labelIndexMap[formatMonth(date)]
      ] = count.listens
    })
  })

  if (listenData) {
    yield put(
      dashboardActions.fetchDashboardListenDataSucceeded(formattedListenData)
    )
  } else {
    yield put(dashboardActions.fetchDashboardListenDataFailed())
  }
}

function* pollForBalance() {
  const remoteConfigInstance = yield getContext('remoteConfigInstance')
  const pollingFreq = remoteConfigInstance.getRemoteVar(
    IntKeys.DASHBOARD_WALLET_BALANCE_POLLING_FREQ_MS
  )
  const chan = yield call(doEvery, pollingFreq, function* () {
    yield put(getBalance())
  })
  yield take(dashboardActions.RESET_DASHBOARD)
  chan.close()
}

function* watchFetchDashboardTracks() {
  yield takeEvery(
    dashboardActions.FETCH_DASHBOARD_TRACKS,
    requiresAccount(fetchDashboardTracksAsync, DASHBOARD_PAGE)
  )
}

function* watchFetchDashboard() {
  yield takeEvery(
    dashboardActions.FETCH_DASHBOARD,
    requiresAccount(fetchDashboardAsync, DASHBOARD_PAGE)
  )
}

function* watchFetchDashboardListenData() {
  yield takeEvery(
    dashboardActions.FETCH_DASHBOARD_LISTEN_DATA,
    fetchDashboardListenDataAsync
  )
}

export default function sagas() {
  return [
    watchFetchDashboard,
    watchFetchDashboardTracks,
    watchFetchDashboardListenData
  ]
}
