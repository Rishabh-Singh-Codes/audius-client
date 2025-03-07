import { ChangeEvent, Component, ComponentType } from 'react'

import {
  ID,
  UID,
  PlayableType,
  RepostSource,
  FavoriteSource,
  Name,
  PlaybackSource,
  ShareSource,
  FollowSource,
  Collection,
  SmartCollection,
  FavoriteType,
  Kind,
  Status,
  Nullable,
  Uid,
  formatUrlName,
  accountSelectors,
  cacheCollectionsActions,
  lineupSelectors,
  collectionPageActions as collectionActions,
  collectionPageLineupActions as tracksActions,
  collectionPageSelectors,
  CollectionPageTrackRecord,
  CollectionTrack,
  CollectionsPageType,
  OverflowAction,
  OverflowSource,
  mobileOverflowMenuUIActions,
  shareModalUIActions,
  RepostType,
  repostsUserListActions,
  favoritesUserListActions,
  collectionsSocialActions as socialCollectionsActions,
  tracksSocialActions as socialTracksActions,
  usersSocialActions as socialUsersActions,
  playerSelectors,
  queueSelectors,
  playlistUpdatesActions,
  playlistUpdatesSelectors
} from '@audius/common'
import { push as pushRoute, replace } from 'connected-react-router'
import { UnregisterCallback } from 'history'
import { connect } from 'react-redux'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import { Dispatch } from 'redux'

import { TrackEvent, make } from 'common/store/analytics/actions'
import DeletedPage from 'pages/deleted-page/DeletedPage'
import { open as openEditCollectionModal } from 'store/application/ui/editPlaylistModal/slice'
import {
  setUsers,
  setVisibility
} from 'store/application/ui/userListModal/slice'
import {
  UserListType,
  UserListEntityType
} from 'store/application/ui/userListModal/types'
import { getLocationPathname } from 'store/routing/selectors'
import { AppState } from 'store/types'
import {
  profilePage,
  NOT_FOUND_PAGE,
  REPOSTING_USERS_ROUTE,
  FAVORITING_USERS_ROUTE,
  collectionPage,
  getPathname
} from 'utils/route'
import { parseCollectionRoute } from 'utils/route/collectionRouteParser'
import { getCollectionPageSEOFields } from 'utils/seo'

import { CollectionPageProps as DesktopCollectionPageProps } from './components/desktop/CollectionPage'
import { CollectionPageProps as MobileCollectionPageProps } from './components/mobile/CollectionPage'
const { selectAllPlaylistUpdateIds } = playlistUpdatesSelectors
const { makeGetCurrent } = queueSelectors
const { getPlaying, getBuffering } = playerSelectors
const { setFavorite } = favoritesUserListActions
const { setRepost } = repostsUserListActions
const { requestOpen: requestOpenShareModal } = shareModalUIActions
const { open } = mobileOverflowMenuUIActions
const {
  getCollection,
  getCollectionStatus,
  getCollectionTracksLineup,
  getCollectionUid,
  getUser,
  getUserUid,
  getCollectionPermalink
} = collectionPageSelectors
const { updatedPlaylistViewed } = playlistUpdatesActions
const { makeGetTableMetadatas, makeGetLineupOrder } = lineupSelectors
const {
  editPlaylist,
  removeTrackFromPlaylist,
  orderPlaylist,
  publishPlaylist,
  deletePlaylist
} = cacheCollectionsActions

const { getUserId, getAccountCollections } = accountSelectors

type OwnProps = {
  type: CollectionsPageType
  isMobile: boolean
  children:
    | ComponentType<MobileCollectionPageProps>
    | ComponentType<DesktopCollectionPageProps>

  // Smart collection props
  smartCollection?: SmartCollection
  playlistByPermalinkEnabled?: boolean
}

type CollectionPageProps = OwnProps &
  ReturnType<ReturnType<typeof makeMapStateToProps>> &
  ReturnType<typeof mapDispatchToProps> &
  RouteComponentProps

type CollectionPageState = {
  filterText: string
  initialOrder: string[] | null
  playlistId: number | null
  reordering: string[] | null
  allowReordering: boolean
  updatingRoute: boolean
}

type PlaylistTrack = { time: number; track: ID; uid?: UID }

class CollectionPage extends Component<
  CollectionPageProps,
  CollectionPageState
> {
  state: CollectionPageState = {
    filterText: '',
    initialOrder: null,
    playlistId: null,
    // For drag + drop reordering
    reordering: null,
    allowReordering: true,

    // Whether the collection is updating its own route.
    // When a user creates a playlist, we eagerly cache it with a fake uid.
    // When the collection is available, a new cache entry is added with the actual id and
    // the existing collection is marked as moved, triggering this component to re-route if rendered.
    updatingRoute: false
  }

  unlisten!: UnregisterCallback

  componentDidMount() {
    this.fetchCollection(getPathname(this.props.location))
    this.unlisten = this.props.history.listen((location, action) => {
      if (
        action !== 'REPLACE' &&
        getPathname(this.props.location) !== getPathname(location)
      ) {
        // If the action is not replace (e.g. we are not trying to update
        // the URL for the same playlist. Reset it.)
        this.resetCollection()
      }
      this.fetchCollection(getPathname(location))
      this.setState({
        initialOrder: null,
        reordering: null
      })
    })
  }

  componentDidUpdate(prevProps: CollectionPageProps) {
    const {
      collection: metadata,
      userUid,
      status,
      user,
      smartCollection,
      tracks,
      pathname,
      fetchCollectionSucceeded,
      type,
      playlistUpdates,
      updatePlaylistLastViewedAt,
      playlistByPermalinkEnabled
    } = this.props

    if (
      type === 'playlist' &&
      this.props.playlistId &&
      playlistUpdates.includes(this.props.playlistId)
    ) {
      updatePlaylistLastViewedAt(this.props.playlistId)
    }

    if (!prevProps.smartCollection && smartCollection) {
      this.fetchCollection(pathname)
    }

    const { updatingRoute, initialOrder } = this.state

    // Reset the initial order if it is unset OR
    // if the uids of the tracks in the lineup are changing with this
    // update (initialOrder should contain ALL of the uids, so it suffices to check the first one).
    const newInitialOrder = tracks.entries.map((track) => track.uid)
    const noInitialOrder = !initialOrder && tracks.entries.length > 0
    const entryIds = new Set(newInitialOrder)
    const newUids =
      Array.isArray(initialOrder) &&
      initialOrder.length > 0 &&
      newInitialOrder.length > 0 &&
      !initialOrder.every((id) => entryIds.has(id))

    if (noInitialOrder || newUids) {
      this.setState({
        initialOrder: newInitialOrder,
        reordering: newInitialOrder
      })
    }

    const params = parseCollectionRoute(pathname, playlistByPermalinkEnabled)

    if (!params) return
    if (status === Status.ERROR) {
      if (
        params &&
        params.collectionId === this.props.playlistId &&
        metadata?.playlist_owner_id !== this.props.userId
      ) {
        // Only route to not found page if still on the collection page and
        // it is erroring on the correct playlistId
        // and it's not our playlist
        this.props.goToRoute(NOT_FOUND_PAGE)
      }
      return
    }

    // Redirect to user tombstone if creator deactivated their account
    if (user && user.is_deactivated) {
      this.props.goToRoute(profilePage(user.handle))
      return
    }

    // Check if the collection has moved in the cache and redirect as needed.
    if (metadata && metadata._moved && !updatingRoute) {
      this.setState({ updatingRoute: true })
      const collectionId = Uid.fromString(metadata._moved).id
      fetchCollectionSucceeded(
        collectionId,
        metadata._moved,
        metadata.permalink || '',
        userUid
      )
      const newPath = pathname.replace(
        `${metadata.playlist_id}`,
        collectionId.toString()
      )
      this.setState(
        {
          playlistId: collectionId,
          initialOrder: null,
          reordering: null
        },
        () => {
          this.props.replaceRoute(newPath)
        }
      )
    }
    if (metadata && !metadata._moved && updatingRoute) {
      this.setState({ updatingRoute: false })
    }

    const { collection: prevMetadata } = prevProps
    if (metadata) {
      const params = parseCollectionRoute(pathname, playlistByPermalinkEnabled)
      if (params) {
        const { collectionId, title, collectionType, handle, permalink } =
          params
        const newCollectionName = formatUrlName(metadata.playlist_name)

        const routeLacksCollectionInfo =
          (title === null || handle === null || collectionType === null) &&
          permalink == null &&
          user
        if (routeLacksCollectionInfo) {
          // Check if we are coming from a non-canonical route and replace route if necessary.
          const newPath = collectionPage(
            user!.handle,
            metadata.playlist_name,
            collectionId,
            metadata.permalink,
            metadata.is_album
          )
          this.props.replaceRoute(newPath)
        } else {
          // Id matches or temp id matches
          const idMatches =
            collectionId === metadata.playlist_id ||
            (metadata._temp && `${collectionId}` === `${metadata.playlist_id}`)
          // Check that the playlist name hasn't changed. If so, update url.
          if (idMatches && title) {
            if (newCollectionName !== title) {
              const newPath = pathname.replace(title, newCollectionName)
              this.props.replaceRoute(newPath)
            }
          }
        }
      }
    }

    // check if a track has been added to collection
    if (
      metadata &&
      prevMetadata &&
      metadata.track_count > prevMetadata.track_count
    ) {
      this.props.fetchTracks()
    }

    // check that the collection content hasn't changed
    if (
      metadata &&
      prevMetadata &&
      !this.playListContentsEqual(
        metadata.playlist_contents.track_ids,
        prevMetadata.playlist_contents.track_ids
      )
    ) {
      this.props.fetchTracks()
    }
  }

  componentWillUnmount() {
    if (this.unlisten) this.unlisten()
    // On mobile, because the transitioning-out collection page unmounts
    // after the transitioning-in collection page mounts, we do not want to reset
    // the collection in unmount. That would end up clearing the content AFTER
    // new content is loaded.
    if (!this.props.isMobile) {
      this.resetCollection()
    }
  }

  playListContentsEqual(
    prevPlaylistContents: PlaylistTrack[],
    curPlaylistContents: PlaylistTrack[]
  ) {
    return (
      prevPlaylistContents.length === curPlaylistContents.length &&
      prevPlaylistContents.reduce(
        (acc, cur, idx) => acc && cur.track === curPlaylistContents[idx].track,
        true
      )
    )
  }

  maybeParseInt = (s: string) => {
    const i = parseInt(s, 10)
    if (i.toString() === s) return i
    return s
  }

  fetchCollection = (pathname: string, forceFetch = false) => {
    const { playlistByPermalinkEnabled } = this.props
    const params = parseCollectionRoute(pathname, playlistByPermalinkEnabled)

    if (params?.permalink) {
      const { permalink, collectionId } = params
      if (forceFetch || params.permalink) {
        this.props.fetchCollection(collectionId, permalink)
        this.props.fetchTracks()
      }
    }

    if (params?.collectionId) {
      const { collectionId } = params
      if (forceFetch || collectionId !== this.state.playlistId) {
        this.setState({ playlistId: collectionId as number })
        this.props.fetchCollection(collectionId as number)
        this.props.fetchTracks()
      }
    }

    if (
      this.props.smartCollection &&
      this.props.smartCollection.playlist_contents
    ) {
      this.props.fetchTracks()
    }
  }

  resetCollection = () => {
    const { collectionUid, userUid } = this.props
    this.props.resetCollection(collectionUid, userUid)
  }

  refreshCollection = () => {
    this.fetchCollection(getPathname(this.props.location), true)
  }

  onFilterChange = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({ filterText: e.target.value })
  }

  isQueued = () => {
    const { tracks, currentQueueItem } = this.props
    return tracks.entries.some((entry) => currentQueueItem.uid === entry.uid)
  }

  getPlayingUid = () => {
    const { currentQueueItem } = this.props
    return currentQueueItem.uid
  }

  getPlayingId = () => {
    const { currentQueueItem } = this.props
    return currentQueueItem.track ? currentQueueItem.track.track_id : null
  }

  formatMetadata = (
    trackMetadatas: CollectionTrack[]
  ): CollectionPageTrackRecord[] => {
    return trackMetadatas.map((metadata, i) => ({
      ...metadata,
      key: `${metadata.title}_${metadata.uid}_${i}`,
      name: metadata.title,
      artist: metadata.user.name,
      handle: metadata.user.handle,
      date: metadata.dateAdded || metadata.created_at,
      time: metadata.duration,
      plays: metadata.play_count
    }))
  }

  getFilteredData = (trackMetadatas: CollectionTrack[]) => {
    const filterText = this.state.filterText
    const { tracks } = this.props
    const playingUid = this.getPlayingUid()
    const playingIndex = tracks.entries.findIndex(
      ({ uid }) => uid === playingUid
    )
    const filteredMetadata = this.formatMetadata(trackMetadatas).filter(
      (item) =>
        item.title.toLowerCase().indexOf(filterText.toLowerCase()) > -1 ||
        item.user.name.toLowerCase().indexOf(filterText.toLowerCase()) > -1
    )
    const filteredIndex =
      playingIndex > -1
        ? filteredMetadata.findIndex((metadata) => metadata.uid === playingUid)
        : playingIndex
    return [filteredMetadata, filteredIndex] as [
      typeof filteredMetadata,
      number
    ]
  }

  onClickRow = (trackRecord: CollectionPageTrackRecord) => {
    const { playing, play, pause, record } = this.props
    const playingUid = this.getPlayingUid()
    if (playing && playingUid === trackRecord.uid) {
      pause()
      record(
        make(Name.PLAYBACK_PAUSE, {
          id: `${trackRecord.track_id}`,
          source: PlaybackSource.PLAYLIST_TRACK
        })
      )
    } else if (playingUid !== trackRecord.uid) {
      play(trackRecord.uid)
      record(
        make(Name.PLAYBACK_PLAY, {
          id: `${trackRecord.track_id}`,
          source: PlaybackSource.PLAYLIST_TRACK
        })
      )
    } else {
      play()
      record(
        make(Name.PLAYBACK_PLAY, {
          id: `${trackRecord.track_id}`,
          source: PlaybackSource.PLAYLIST_TRACK
        })
      )
    }
  }

  onClickDescriptionExternalLink = (event: any) => {
    const { record } = this.props
    record(
      make(Name.LINK_CLICKING, {
        url: event.target.href,
        source: 'collection page'
      })
    )
  }

  onClickSave = (record: CollectionPageTrackRecord) => {
    if (!record.has_current_user_saved) {
      this.props.saveTrack(record.track_id)
    } else {
      this.props.unsaveTrack(record.track_id)
    }
  }

  onClickTrackName = (record: CollectionPageTrackRecord) => {
    this.props.goToRoute(record.permalink)
  }

  onClickArtistName = (record: CollectionPageTrackRecord) => {
    this.props.goToRoute(profilePage(record.handle))
  }

  onClickRepostTrack = (record: CollectionPageTrackRecord) => {
    if (!record.has_current_user_reposted) {
      this.props.repostTrack(record.track_id)
    } else {
      this.props.undoRepostTrack(record.track_id)
    }
  }

  onClickRemove = (
    trackId: number,
    index: number,
    uid: string,
    timestamp: number
  ) => {
    const { playlistId } = this.props
    this.props.removeTrackFromPlaylist(
      trackId,
      playlistId as number,
      uid,
      timestamp
    )

    // Remove the track from the initial order,
    // because reorder uses initial order as a starting point
    const initialOrder = this.state.initialOrder
      ? [
          ...this.state.initialOrder.slice(0, index),
          ...this.state.initialOrder.slice(index + 1)
        ]
      : null
    this.setState({ initialOrder })
  }

  onPlay = () => {
    const {
      playing,
      play,
      pause,
      tracks: { entries },
      record
    } = this.props
    const isQueued = this.isQueued()
    const playingId = this.getPlayingId()
    if (playing && isQueued) {
      pause()
      record(
        make(Name.PLAYBACK_PAUSE, {
          id: `${playingId}`,
          source: PlaybackSource.PLAYLIST_PAGE
        })
      )
    } else if (!playing && isQueued) {
      play()
      record(
        make(Name.PLAYBACK_PLAY, {
          id: `${playingId}`,
          source: PlaybackSource.PLAYLIST_PAGE
        })
      )
    } else if (entries.length > 0) {
      play(entries[0].uid)
      record(
        make(Name.PLAYBACK_PLAY, {
          id: `${entries[0].track_id}`,
          source: PlaybackSource.PLAYLIST_PAGE
        })
      )
    }
  }

  onSortTracks = (sorters: any) => {
    const { column, order } = sorters
    const {
      tracks: { entries }
    } = this.props
    const dataSource = this.formatMetadata(entries)
    let updatedOrder
    if (!column) {
      updatedOrder = this.state.initialOrder
      this.setState({ allowReordering: true })
    } else {
      updatedOrder = dataSource
        .sort((a, b) =>
          order === 'ascend' ? column.sorter(a, b) : column.sorter(b, a)
        )
        .map((metadata) => metadata.uid)
      this.setState({ allowReordering: false })
    }
    if (updatedOrder) {
      this.props.updateLineupOrder(updatedOrder)
    }
  }

  onReorderTracks = (source: number, destination: number) => {
    const { tracks, order } = this.props

    const newOrder = Array.from(this.state.initialOrder!)
    newOrder.splice(source, 1)
    newOrder.splice(destination, 0, this.state.initialOrder![source])

    const trackIdAndTimes = newOrder.map((uid: any) => ({
      id: tracks.entries[order[uid]].track_id,
      time: tracks.entries[order[uid]].dateAdded.unix()
    }))

    this.props.updateLineupOrder(newOrder)
    this.setState({ initialOrder: newOrder })
    this.props.orderPlaylist(this.props.playlistId!, trackIdAndTimes, newOrder)
  }

  onPublish = () => {
    this.props.publishPlaylist(this.props.playlistId!)
  }

  onSavePlaylist = (isSaved: boolean, playlistId: number) => {
    if (isSaved) {
      this.props.unsaveCollection(playlistId)
    } else {
      this.props.saveCollection(playlistId)
    }
  }

  onSaveSmartCollection = (isSaved: boolean, smartCollectionName: string) => {
    if (isSaved) {
      this.props.unsaveSmartCollection(smartCollectionName)
    } else {
      this.props.saveSmartCollection(smartCollectionName)
    }
  }

  onRepostPlaylist = (isReposted: boolean, playlistId: number) => {
    if (isReposted) {
      this.props.undoRepostCollection(playlistId)
    } else {
      this.props.repostCollection(playlistId)
    }
  }

  onSharePlaylist = (playlistId: number) => {
    this.props.shareCollection(playlistId)
  }

  onHeroTrackClickArtistName = () => {
    const { goToRoute, user } = this.props
    const playlistOwnerHandle = user ? user.handle : ''
    goToRoute(profilePage(playlistOwnerHandle))
  }

  onHeroTrackEdit = () => {
    if (this.props.playlistId)
      this.props.onEditCollection(this.props.playlistId)
  }

  onHeroTrackShare = () => {
    const { playlistId } = this.props
    this.onSharePlaylist(playlistId!)
  }

  onHeroTrackSave = () => {
    const { userPlaylists, collection: metadata, smartCollection } = this.props
    const { playlistId } = this.props
    const isSaved =
      (metadata && playlistId
        ? metadata.has_current_user_saved || playlistId in userPlaylists
        : false) ||
      (smartCollection && smartCollection.has_current_user_saved)

    if (smartCollection && metadata) {
      this.onSaveSmartCollection(!!isSaved, metadata.playlist_name)
    } else {
      this.onSavePlaylist(!!isSaved, playlistId!)
    }
  }

  onHeroTrackRepost = () => {
    const { collection: metadata } = this.props
    const { playlistId } = this.props
    const isReposted = metadata ? metadata.has_current_user_reposted : false
    this.onRepostPlaylist(isReposted, playlistId!)
  }

  onClickReposts = () => {
    const {
      collection: metadata,
      setRepostPlaylistId,
      goToRoute,
      isMobile,
      setRepostUsers,
      setModalVisibility
    } = this.props
    if (!metadata) return
    if (isMobile) {
      setRepostPlaylistId(metadata.playlist_id)
      goToRoute(REPOSTING_USERS_ROUTE)
    } else {
      setRepostUsers(metadata.playlist_id)
      setModalVisibility()
    }
  }

  onClickFavorites = () => {
    const {
      collection: metadata,
      setFavoritePlaylistId,
      goToRoute,
      isMobile,
      setFavoriteUsers,
      setModalVisibility
    } = this.props
    if (!metadata) return
    if (isMobile) {
      setFavoritePlaylistId(metadata.playlist_id)
      goToRoute(FAVORITING_USERS_ROUTE)
    } else {
      setFavoriteUsers(metadata.playlist_id)
      setModalVisibility()
    }
  }

  onFollow = () => {
    const { onFollow, collection: metadata } = this.props
    if (metadata) onFollow(metadata.playlist_owner_id)
  }

  onUnfollow = () => {
    const { onUnfollow, collection: metadata } = this.props
    if (metadata) onUnfollow(metadata.playlist_owner_id)
  }

  render() {
    const {
      playing,
      type,
      status,
      collection: metadata,
      user,
      tracks,
      userId,
      userPlaylists,
      smartCollection,
      onClickDescriptionInternalLink
    } = this.props
    const { allowReordering } = this.state
    const { playlistId } = this.props

    const {
      title = '',
      description = '',
      canonicalUrl = '',
      structuredData
    } = getCollectionPageSEOFields({
      playlistName: metadata?.playlist_name,
      playlistId: metadata?.playlist_id,
      userName: user?.name,
      userHandle: user?.handle,
      isAlbum: metadata?.is_album,
      permalink: metadata?.permalink
    })

    const childProps = {
      title,
      description,
      canonicalUrl,
      structuredData,
      playlistId: playlistId!,
      allowReordering,
      playing,
      type,
      collection: smartCollection
        ? { status: Status.SUCCESS, metadata: smartCollection, user: null }
        : { status, metadata, user },
      tracks,
      userId,
      userPlaylists,
      getPlayingUid: this.getPlayingUid,
      getFilteredData: this.getFilteredData,
      isQueued: this.isQueued,
      onHeroTrackClickArtistName: this.onHeroTrackClickArtistName,
      onFilterChange: this.onFilterChange,
      onPlay: this.onPlay,
      onHeroTrackEdit: this.onHeroTrackEdit,
      onPublish: this.onPublish,
      onHeroTrackShare: this.onHeroTrackShare,
      onHeroTrackSave: this.onHeroTrackSave,
      onHeroTrackRepost: this.onHeroTrackRepost,
      onClickRow: this.onClickRow,
      onClickSave: this.onClickSave,
      onClickTrackName: this.onClickTrackName,
      onClickArtistName: this.onClickArtistName,
      onClickRepostTrack: this.onClickRepostTrack,
      onClickDescriptionExternalLink: this.onClickDescriptionExternalLink,
      onClickDescriptionInternalLink,
      onSortTracks: this.onSortTracks,
      onReorderTracks: this.onReorderTracks,
      onClickRemove: this.onClickRemove,
      onClickMobileOverflow: this.props.clickOverflow,
      onClickFavorites: this.onClickFavorites,
      onClickReposts: this.onClickReposts,
      onFollow: this.onFollow,
      onUnfollow: this.onUnfollow,
      refresh: this.refreshCollection
    }

    if ((metadata?.is_delete || metadata?._marked_deleted) && user) {
      return (
        <DeletedPage
          title={title}
          description={description}
          canonicalUrl={canonicalUrl}
          structuredData={structuredData}
          playable={{
            metadata,
            type: metadata?.is_album
              ? PlayableType.ALBUM
              : PlayableType.PLAYLIST
          }}
          user={user}
        />
      )
    }

    // Note:
    // While some of our other page components key by playlist id, etc.
    // here to allow for multiple pages to be in view at the same time while
    // animating. Because we use temporary ids (which impact the URL) for
    // playlists during creation, we can't simply key here by path or playlistId
    // because we do not want a playlist transitioning from temp => not temp
    // to trigger a rerender of everything
    return <this.props.children {...childProps} />
  }
}

function makeMapStateToProps() {
  const getTracksLineup = makeGetTableMetadatas(getCollectionTracksLineup)
  const getLineupOrder = makeGetLineupOrder(getCollectionTracksLineup)
  const getCurrentQueueItem = makeGetCurrent()

  const mapStateToProps = (state: AppState) => {
    return {
      tracks: getTracksLineup(state),
      collectionUid: getCollectionUid(state) || '',
      collection: getCollection(state) as Collection,
      collectionPermalink: getCollectionPermalink(state),
      user: getUser(state),
      userUid: getUserUid(state) || '',
      status: getCollectionStatus(state) || '',
      order: getLineupOrder(state),
      userId: getUserId(state),
      playlistId: (getCollection(state) as Collection)?.playlist_id,
      userPlaylists: getAccountCollections(state),
      currentQueueItem: getCurrentQueueItem(state),
      playing: getPlaying(state),
      buffering: getBuffering(state),
      pathname: getLocationPathname(state),
      playlistUpdates: selectAllPlaylistUpdateIds(state)
    }
  }
  return mapStateToProps
}

function mapDispatchToProps(dispatch: Dispatch) {
  return {
    fetchCollection: (id: Nullable<number>, permalink?: string) =>
      dispatch(collectionActions.fetchCollection(id, permalink)),
    fetchTracks: () =>
      dispatch(tracksActions.fetchLineupMetadatas(0, 200, false, undefined)),
    resetCollection: (collectionUid: string, userUid: string) =>
      dispatch(collectionActions.resetCollection(collectionUid, userUid)),
    goToRoute: (route: string) => dispatch(pushRoute(route)),
    replaceRoute: (route: string) => dispatch(replace(route)),
    play: (uid?: string) => dispatch(tracksActions.play(uid)),
    pause: () => dispatch(tracksActions.pause()),
    updateLineupOrder: (updatedOrderIndices: any) =>
      dispatch(tracksActions.updateLineupOrder(updatedOrderIndices)),
    editPlaylist: (playlistId: number, formFields: any) =>
      dispatch(editPlaylist(playlistId, formFields)),
    removeTrackFromPlaylist: (
      trackId: number,
      playlistId: number,
      uid: string,
      timestamp: number
    ) => {
      dispatch(removeTrackFromPlaylist(trackId, playlistId, timestamp))
      dispatch(tracksActions.remove(Kind.TRACKS, uid))
    },
    orderPlaylist: (playlistId: number, trackIds: any, trackUids: string[]) =>
      dispatch(orderPlaylist(playlistId, trackIds, trackUids)),
    publishPlaylist: (playlistId: number) =>
      dispatch(publishPlaylist(playlistId)),
    deletePlaylist: (playlistId: number) =>
      dispatch(deletePlaylist(playlistId)),

    saveCollection: (playlistId: number) =>
      dispatch(
        socialCollectionsActions.saveCollection(
          playlistId,
          FavoriteSource.COLLECTION_PAGE
        )
      ),
    saveSmartCollection: (smartCollectionName: string) =>
      dispatch(
        socialCollectionsActions.saveSmartCollection(
          smartCollectionName,
          FavoriteSource.COLLECTION_PAGE
        )
      ),

    unsaveCollection: (playlistId: number) =>
      dispatch(
        socialCollectionsActions.unsaveCollection(
          playlistId,
          FavoriteSource.COLLECTION_PAGE
        )
      ),
    unsaveSmartCollection: (smartCollectionName: string) =>
      dispatch(
        socialCollectionsActions.unsaveSmartCollection(
          smartCollectionName,
          FavoriteSource.COLLECTION_PAGE
        )
      ),

    repostCollection: (playlistId: number) =>
      dispatch(
        socialCollectionsActions.repostCollection(
          playlistId,
          RepostSource.COLLECTION_PAGE
        )
      ),
    undoRepostCollection: (playlistId: number) =>
      dispatch(
        socialCollectionsActions.undoRepostCollection(
          playlistId,
          RepostSource.COLLECTION_PAGE
        )
      ),
    shareCollection: (playlistId: number) =>
      dispatch(
        requestOpenShareModal({
          type: 'collection',
          collectionId: playlistId,
          source: ShareSource.TILE
        })
      ),
    repostTrack: (trackId: number) =>
      dispatch(
        socialTracksActions.repostTrack(trackId, RepostSource.COLLECTION_PAGE)
      ),
    undoRepostTrack: (trackId: number) =>
      dispatch(
        socialTracksActions.undoRepostTrack(
          trackId,
          RepostSource.COLLECTION_PAGE
        )
      ),
    saveTrack: (trackId: number) =>
      dispatch(
        socialTracksActions.saveTrack(trackId, FavoriteSource.COLLECTION_PAGE)
      ),
    unsaveTrack: (trackId: number) =>
      dispatch(
        socialTracksActions.unsaveTrack(trackId, FavoriteSource.COLLECTION_PAGE)
      ),
    fetchCollectionSucceeded: (
      collectionId: ID,
      collectionUid: string,
      collectionPermalink: string,
      userId: string
    ) =>
      dispatch(
        collectionActions.fetchCollectionSucceeded(
          collectionId,
          collectionUid,
          collectionPermalink,
          userId
        )
      ),
    onFollow: (userId: ID) =>
      dispatch(
        socialUsersActions.followUser(userId, FollowSource.COLLECTION_PAGE)
      ),
    onUnfollow: (userId: ID) =>
      dispatch(
        socialUsersActions.unfollowUser(userId, FollowSource.COLLECTION_PAGE)
      ),
    clickOverflow: (collectionId: ID, overflowActions: OverflowAction[]) =>
      dispatch(
        open({
          source: OverflowSource.COLLECTIONS,
          id: collectionId,
          overflowActions
        })
      ),
    setRepostPlaylistId: (collectionId: ID) =>
      dispatch(setRepost(collectionId, RepostType.COLLECTION)),
    setFavoritePlaylistId: (collectionId: ID) =>
      dispatch(setFavorite(collectionId, FavoriteType.PLAYLIST)),
    record: (event: TrackEvent) => dispatch(event),
    setRepostUsers: (trackID: ID) =>
      dispatch(
        setUsers({
          userListType: UserListType.REPOST,
          entityType: UserListEntityType.COLLECTION,
          id: trackID
        })
      ),
    setFavoriteUsers: (trackID: ID) =>
      dispatch(
        setUsers({
          userListType: UserListType.FAVORITE,
          entityType: UserListEntityType.COLLECTION,
          id: trackID
        })
      ),
    setModalVisibility: () => dispatch(setVisibility(true)),
    onEditCollection: (collectionId: ID) =>
      dispatch(
        openEditCollectionModal({ collectionId, isCollectionViewed: true })
      ),
    updatePlaylistLastViewedAt: (playlistId: ID) =>
      dispatch(updatedPlaylistViewed({ playlistId })),
    onClickDescriptionInternalLink: (path: string) => dispatch(pushRoute(path))
  }
}

export default withRouter(
  connect(makeMapStateToProps, mapDispatchToProps)(CollectionPage)
)
