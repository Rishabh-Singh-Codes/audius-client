import type { ComponentType, ReactNode } from 'react'
import { useCallback, useMemo, useRef, useState } from 'react'

import type { Nullable } from '@audius/common'
import Color from 'color'
import { merge } from 'lodash'
import type {
  ButtonProps as RNButtonProps,
  PressableProps,
  ViewStyle,
  TextStyle,
  LayoutChangeEvent,
  GestureResponderEvent
} from 'react-native'
import { Pressable, Text, Animated, View, StyleSheet } from 'react-native'
import type { SvgProps } from 'react-native-svg'

import { light, medium } from 'app/haptics'
import { useColorAnimation } from 'app/hooks/usePressColorAnimation'
import { usePressScaleAnimation } from 'app/hooks/usePressScaleAnimation'
import type { StylesProp } from 'app/styles'
import { flexRowCentered, makeStyles } from 'app/styles'
import { useThemeColors } from 'app/utils/theme'

import { Link } from './Link'

const useStyles = makeStyles<
  Required<
    Pick<ButtonProps, 'size' | 'variant' | 'corners'> & { isPressing: boolean }
  >
>(
  (
    { palette, spacing, typography },
    { isPressing, size, variant, corners }
  ) => {
    const commonVariantStyles = {
      root: {
        borderColor: palette.neutralLight6,
        borderWidth: 1,
        backgroundColor: palette.white
      },
      text: {
        color: palette.neutral
      },
      icon: {
        color: palette.neutral
      }
    }

    const variantStyles = {
      primary: {
        root: {
          backgroundColor: palette.primary,
          borderWidth: 0
        },
        text: {
          color: palette.staticWhite
        },
        icon: {
          color: palette.staticWhite
        }
      },
      primaryAlt: {
        root: {
          borderColor: palette.primaryDark1,
          borderWidth: 1,
          backgroundColor: palette.white
        },
        text: {
          color: palette.primary
        },
        icon: {
          color: palette.primary
        }
      },
      secondary: {
        root: {
          backgroundColor: palette.secondary,
          borderWidth: 0
        },
        text: {
          color: palette.staticWhite
        },
        icon: {
          color: palette.staticWhite
        }
      },
      common: commonVariantStyles,
      commonAlt: commonVariantStyles,
      commonSecondary: commonVariantStyles,
      destructive: {
        root: {
          backgroundColor: palette.accentRed
        },
        text: {
          color: palette.staticWhite
        },
        icon: {
          color: palette.staticWhite
        }
      }
    }

    const variantPressingStyles = {
      primaryAlt: variantStyles.primary,
      common: variantStyles.primary,
      commonAlt: variantStyles.commonAlt,
      commonSecondary: variantStyles.secondary,
      destructive: variantStyles.destructive
    }

    const sizeStyles = {
      xs: {
        button: {
          height: spacing(6),
          paddingHorizontal: spacing(3)
        },
        text: {
          fontSize: typography.fontSize.small,
          fontFamily: typography.fontByWeight.bold
        }
      },
      small: {
        button: {
          height: spacing(8),
          paddingHorizontal: spacing(2)
        },
        text: {
          textTransform: 'uppercase',
          fontSize: 11
        },
        icon: {
          height: spacing(5),
          width: spacing(5)
        },
        iconLeft: {
          marginRight: spacing(1)
        },
        iconRight: {
          marginLeft: spacing(1)
        }
      },
      medium: {
        button: {
          height: spacing(10),
          paddingHorizontal: spacing(6)
        },
        text: {
          fontSize: 14
        },
        icon: {
          height: spacing(6),
          width: spacing(6)
        },
        iconLeft: {
          marginRight: spacing(1)
        },
        iconRight: {
          marginLeft: spacing(1)
        }
      },
      large: {
        button: {
          height: spacing(12),
          paddingHorizontal: spacing(8)
        },
        text: {
          fontSize: 18
        },
        icon: {
          height: spacing(8),
          width: spacing(8)
        },
        iconLeft: {
          marginRight: spacing(2)
        },
        iconRight: {
          marginLeft: spacing(2)
        }
      }
    }

    const cornerStyles = {
      rounded: {
        root: {
          borderRadius: spacing(1)
        }
      },
      pill: {
        root: {
          borderRadius: spacing(10)
        }
      }
    }

    const baseStyles = {
      root: {
        ...flexRowCentered(),
        justifyContent: 'center',
        alignSelf: 'center',
        // this should never be used, but helps merge with the types
        backgroundColor: palette.primary
      },
      button: {
        ...flexRowCentered(),
        justifyContent: 'center'
      },
      text: {
        fontFamily: typography.fontByWeight.bold,
        letterSpacing: 0.5
      }
    }

    return merge(
      baseStyles,
      variantStyles[variant],
      isPressing && variantPressingStyles[variant],
      sizeStyles[size],
      cornerStyles[corners]
    )
  }
)

export type ButtonProps = Omit<RNButtonProps, 'title'> &
  PressableProps & {
    icon?: ComponentType<SvgProps>
    iconPosition?: 'left' | 'right'
    IconProps?: SvgProps
    fullWidth?: boolean
    noText?: boolean
    size?: 'xs' | 'small' | 'medium' | 'large'
    style?: ViewStyle
    styles?: StylesProp<{
      root: ViewStyle
      button: ViewStyle
      icon: ViewStyle
      text: TextStyle
    }>
    variant?:
      | 'primary'
      | 'primaryAlt'
      | 'secondary'
      | 'common'
      | 'commonAlt'
      | 'commonSecondary'
      | 'destructive'
    haptics?: boolean | 'light' | 'medium'
    url?: string
    // Custom color that will override the variant
    color?: string
    corners?: 'rounded' | 'pill'
    title: ReactNode
    pressScale?: number
  }

export const Button = (props: ButtonProps) => {
  const {
    accessibilityLabel,
    color: customColor,
    corners = 'rounded',
    disabled,
    fullWidth,
    haptics,
    icon: Icon,
    iconPosition = 'right',
    IconProps,
    noText,
    onPress,
    onPressIn,
    onPressOut,
    pressScale = 0.97,
    size = 'medium',
    style,
    styles: stylesProp,
    title,
    url,
    variant = 'primary',
    ...other
  } = props
  const [isPressing, setIsPressing] = useState(false)
  const stylesConfig = useMemo(
    () => ({ isPressing, size, variant, corners }),
    [isPressing, size, variant, corners]
  )
  const styles = useStyles(stylesConfig)
  const rootLayoutRef =
    useRef<Nullable<{ height: number; width: number }>>(null)
  const {
    scale,
    handlePressIn: handlePressInScale,
    handlePressOut: handlePressOutScale
  } = usePressScaleAnimation(pressScale, false)

  const {
    primaryDark1,
    secondaryDark1,
    neutralLight10,
    neutralLight7,
    accentRedDark1
  } = useThemeColors()

  const pressColor = useMemo(() => {
    // If a custom color is specified
    // darken the color by 10% for the press state
    if (customColor) {
      const c = new Color(customColor)
      return c.darken(0.1).hex()
    }

    // If no custom color is specified
    // derive the press state color for the variant
    return {
      primary: primaryDark1,
      primaryAlt: primaryDark1,
      secondary: secondaryDark1,
      common: primaryDark1,
      commonAlt: neutralLight10,
      commonSecondary: secondaryDark1,
      destructive: accentRedDark1
    }[variant]
  }, [
    customColor,
    variant,
    primaryDark1,
    secondaryDark1,
    neutralLight10,
    accentRedDark1
  ])

  const {
    color,
    handlePressIn: handlePressInColor,
    handlePressOut: handlePressOutColor
  } = useColorAnimation(
    customColor ?? (styles.root.backgroundColor as string),
    pressColor
  )

  const handlePressIn = useCallback(
    (event) => {
      onPressIn?.(event)
      setIsPressing(true)
      handlePressInScale()
      handlePressInColor()
    },
    [onPressIn, handlePressInScale, handlePressInColor]
  )

  const handlePressOut = useCallback(
    (event) => {
      onPressOut?.(event)
      setIsPressing(false)
      handlePressOutScale()
      handlePressOutColor()
    },
    [onPressOut, handlePressOutScale, handlePressOutColor]
  )

  const handleHaptics = useCallback(() => {
    if (haptics === 'light') light()
    else if (haptics === 'medium') medium()
    else if (haptics) medium()
  }, [haptics])

  const handlePress = useCallback(
    (e: GestureResponderEvent) => {
      handleHaptics()
      onPress?.(e)
    },
    [handleHaptics, onPress]
  )

  // Ensures button takes up a static height even when scaling
  const handleRootLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const { height, width } = event.nativeEvent.layout
      rootLayoutRef.current = { height, width }
    },
    [rootLayoutRef]
  )

  // @ts-ignore type issue with flattened style. iconColor prop is optional
  const { color: iconColor, ...iconStyles } = StyleSheet.flatten([
    styles.icon,
    stylesProp?.icon
  ])

  const icon = Icon ? (
    <Icon
      style={[
        iconPosition === 'left' ? styles.iconLeft : styles.iconRight,
        iconStyles,
        noText && { marginLeft: 0, marginRight: 0 }
      ]}
      height={iconStyles.height}
      width={iconStyles.width}
      fill={iconColor}
      {...IconProps}
    />
  ) : null

  const PressableComponent = url ? Link : Pressable

  return (
    <View style={rootLayoutRef.current} onLayout={handleRootLayout}>
      <Animated.View
        style={[
          styles.root,
          { transform: [{ scale }], backgroundColor: color },
          fullWidth && { width: '100%' },
          style,
          stylesProp?.root,
          disabled && { backgroundColor: neutralLight7 }
        ]}
      >
        <PressableComponent
          url={url as string}
          style={[
            styles.button,
            fullWidth && { width: '100%' },
            stylesProp?.button
          ]}
          accessibilityRole='button'
          accessibilityLabel={
            accessibilityLabel ??
            (noText && typeof title === 'string' ? title : undefined)
          }
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled}
          {...other}
        >
          {iconPosition !== 'left' ? null : icon}
          {noText ? null : typeof title === 'string' ? (
            <Text style={[styles.text, stylesProp?.text]}>{title}</Text>
          ) : (
            title
          )}
          {iconPosition !== 'right' ? null : icon}
        </PressableComponent>
      </Animated.View>
    </View>
  )
}
