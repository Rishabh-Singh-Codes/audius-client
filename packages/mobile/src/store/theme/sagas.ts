import type { SystemAppearance } from '@audius/common'
import { themeSelectors, Theme, themeActions } from '@audius/common'
import type { PayloadAction } from '@reduxjs/toolkit'
import { eventEmitter, initialMode } from 'react-native-dark-mode'
import { put, call, spawn, takeEvery, select } from 'typed-redux-saga'

import { THEME_STORAGE_KEY } from 'app/constants/storage-keys'
import { localStorage } from 'app/services/local-storage'
import { updateStatusBarTheme, setStatusBarTheme } from 'app/utils/theme'
const { setTheme, setSystemAppearance } = themeActions
const { getTheme, getSystemAppearance } = themeSelectors

const waitForSystemAppearanceChange = async () => {
  let listener

  const systemAppearance = await new Promise<SystemAppearance>((resolve) => {
    listener = (mode: SystemAppearance) => {
      resolve(mode)
    }
    eventEmitter.on('currentModeChanged', listener)
  })

  eventEmitter.removeListener('currentModeChanged', listener)

  return systemAppearance
}

function* watchSystemAppearanceChange() {
  while (true) {
    const systemAppearance = yield* select(getSystemAppearance)
    const theme = yield* select(getTheme)
    if (!systemAppearance) {
      yield* put(
        setSystemAppearance({
          systemAppearance: initialMode as SystemAppearance
        })
      )
    } else {
      const systemAppearance = yield* call(waitForSystemAppearanceChange)
      if (theme === Theme.AUTO) {
        setStatusBarTheme(systemAppearance)
      }
      yield* put(setSystemAppearance({ systemAppearance }))
    }
  }
}

function* setThemeAsync(action: PayloadAction<{ theme: Theme }>) {
  const systemAppearance = yield* select(getSystemAppearance)
  const { theme } = action.payload
  updateStatusBarTheme(theme, systemAppearance)

  yield* call([localStorage, 'setItem'], THEME_STORAGE_KEY, theme)
}

function* watchSetTheme() {
  yield* takeEvery(setTheme, setThemeAsync)
}

function* setupTheme() {
  const savedTheme = yield* call([localStorage, 'getItem'], THEME_STORAGE_KEY)

  if (!savedTheme) {
    yield* put(setTheme({ theme: Theme.DEFAULT }))
  } else {
    yield* put(setTheme({ theme: savedTheme as Theme }))
  }

  yield* spawn(watchSystemAppearanceChange)
}

export default function sagas() {
  return [setupTheme, watchSetTheme]
}
