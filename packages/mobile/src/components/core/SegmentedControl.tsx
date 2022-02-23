import { Fragment, useState, useEffect, useRef } from 'react'

import {
  Animated,
  LayoutChangeEvent,
  Pressable,
  TextStyle,
  View,
  ViewStyle,
  Text
} from 'react-native'

import { makeStyles, StylesProps } from 'app/styles'

// Note, offset is the inner padding of the container div
const offset = 3

export type Option = {
  key: string
  text: string
}

export type SegmentedControlProps = {
  // The options to display for the tab slider
  options: Array<Option>

  // Key of selected option
  selected?: string

  // Key of initially selected option
  defaultSelected?: string

  // Callback fired when new option is selected
  onSelectOption: (key: string) => void

  fullWidth?: boolean
} & StylesProps<{
  root: ViewStyle
  tab: ViewStyle
  text: TextStyle
  activeText: TextStyle
}>

const springToValue = (
  animation: Animated.Value,
  value: number,
  finished?: () => void
) => {
  Animated.spring(animation, {
    toValue: value,
    tension: 160,
    friction: 15,
    useNativeDriver: false
  }).start(finished)
}

const useStyles = makeStyles(({ palette, typography, spacing }) => ({
  tabs: {
    borderRadius: 6,
    backgroundColor: palette.neutralLight7,
    flexDirection: 'row',
    alignItems: 'center',
    padding: offset,
    paddingRight: 0
  },
  tab: {
    elevation: 3,
    paddingVertical: spacing(2),
    paddingHorizontal: spacing(4),
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center'
  },
  text: {
    color: palette.neutral,
    fontSize: 13,
    fontFamily: typography.fontByWeight.demiBold
  },
  separator: {
    width: 1,
    backgroundColor: palette.neutralLight5,
    height: 15
  },
  hideSeparator: {
    opacity: 0
  },
  slider: {
    position: 'absolute',
    elevation: 2,
    top: 3,
    bottom: 3,
    borderRadius: 4,
    backgroundColor: palette.white,
    shadowOpacity: 0.1,
    shadowOffset: {
      width: 0,
      height: 10
    }
  },
  fullWidth: {
    width: '100%'
  },
  tabFullWidth: {
    flex: 1,
    textAlign: 'center'
  }
}))

export const SegmentedControl = (props: SegmentedControlProps) => {
  const {
    options,
    selected: selectedProp,
    defaultSelected = options[0].key,
    onSelectOption,
    fullWidth,
    style,
    styles: stylesProp
  } = props
  const styles = useStyles()
  const optionWidths = useRef<Array<number>>(options.map(() => 0))
  const leftAnim = useRef(new Animated.Value(0)).current
  const widthAnim = useRef(new Animated.Value(0)).current
  const [selected, setSelected] = useState(defaultSelected)
  const selectedOption = selectedProp ?? selected

  const handleSelectOption = (option: string) => {
    onSelectOption?.(option)
    setSelected(option)
  }

  useEffect(() => {
    const selectedOptionIdx = options.findIndex(
      option => option.key === selectedOption
    )
    const width = optionWidths.current[selectedOptionIdx]
    const left = optionWidths.current
      .slice(0, selectedOptionIdx)
      .reduce((totalWidth, width) => totalWidth + width, offset)

    springToValue(leftAnim, left)
    springToValue(widthAnim, width)
  }, [options, selectedOption, leftAnim, widthAnim])

  const setOptionWidth = (i: number) => (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout

    if (i === 0) {
      springToValue(leftAnim, offset)
      springToValue(widthAnim, width)
    }
    optionWidths.current[i] = width
  }

  const sliderElement = (
    <Animated.View
      style={[styles.slider, { left: leftAnim, width: widthAnim }]}
    />
  )

  return (
    <View
      style={[
        styles.tabs,
        fullWidth && styles.fullWidth,
        style,
        stylesProp?.root
      ]}
    >
      {sliderElement}
      {options.map((option, index) => {
        const shouldHideSeparator =
          selectedOption === option.key ||
          // Hide separator right of the last option
          index === options.length - 1 ||
          // Hide separator right of an option if the next one is selected
          selectedOption === options[index + 1].key

        return (
          <Fragment key={option.key}>
            <Pressable
              onLayout={setOptionWidth(index)}
              style={[
                styles.tab,
                stylesProp?.tab,
                fullWidth && styles.tabFullWidth
              ]}
              onPress={() => handleSelectOption(option.key)}
            >
              <Text
                style={[
                  styles.text,
                  stylesProp?.text,
                  selectedOption === option.key && stylesProp?.activeText
                ]}
              >
                {option.text}
              </Text>
            </Pressable>
            <View
              style={[
                styles.separator,
                shouldHideSeparator && styles.hideSeparator
              ]}
            />
          </Fragment>
        )
      })}
    </View>
  )
}
