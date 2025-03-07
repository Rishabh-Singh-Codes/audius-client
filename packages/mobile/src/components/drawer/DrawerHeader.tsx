import type { ComponentType } from 'react'

import type { ImageSourcePropType } from 'react-native'
import { TouchableOpacity, View, Image, Text } from 'react-native'

import IconRemove from 'app/assets/images/iconRemove.svg'
import { makeStyles } from 'app/styles'
import type { SvgProps } from 'app/types/svg'
import { useColor } from 'app/utils/theme'

type DrawerHeaderProps = {
  onClose: () => void
  title?: string
  titleIcon?: ComponentType<SvgProps>
  titleImage?: ImageSourcePropType
  isFullscreen?: boolean
}

export const useStyles = makeStyles(({ palette, typography, spacing }) => ({
  titleBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing(6)
  },

  dismissContainer: {
    position: 'absolute',
    top: spacing(6),
    left: spacing(6)
  },

  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing(5)
  },

  titleIcon: {
    marginRight: spacing(3),
    height: spacing(6),
    width: spacing(6)
  },

  titleLabel: {
    fontFamily: typography.fontByWeight.bold,
    fontSize: typography.fontSize.large,
    color: palette.neutral
  }
}))

export const DrawerHeader = (props: DrawerHeaderProps) => {
  const {
    onClose,
    title,
    titleIcon: TitleIcon,
    titleImage,
    isFullscreen
  } = props
  const styles = useStyles()
  const iconRemoveColor = useColor('neutralLight4')
  const titleIconColor = useColor('neutral')

  return title || isFullscreen ? (
    <View style={styles.titleBarContainer}>
      {isFullscreen && (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onClose}
          style={styles.dismissContainer}
        >
          <IconRemove width={30} height={30} fill={iconRemoveColor} />
        </TouchableOpacity>
      )}
      {title && (
        <View style={styles.titleContainer}>
          {TitleIcon ? (
            <TitleIcon style={styles.titleIcon} fill={titleIconColor} />
          ) : null}
          {titleImage ? (
            <Image style={styles.titleIcon} source={titleImage} />
          ) : null}
          <Text style={styles.titleLabel}>{title}</Text>
        </View>
      )}
    </View>
  ) : (
    <View />
  )
}
