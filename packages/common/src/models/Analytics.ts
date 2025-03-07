import { ChatPermission } from '@audius/sdk'

import { FeedFilter } from 'models/FeedFilter'
import { ID, PlayableType } from 'models/Identifiers'
import { MonitorPayload, ServiceMonitorType } from 'models/Services'
import { TimeRange } from 'models/TimeRange'
import { SolanaWalletAddress, StringAudio, WalletAddress } from 'models/Wallet'

import { Chain } from './Chain'
import { PlaylistLibraryKind } from './PlaylistLibrary'

const ANALYTICS_TRACK_EVENT = 'ANALYTICS/TRACK_EVENT'

type JsonMap = Record<string, unknown>

export type AnalyticsEvent = {
  eventName: string
  properties?: JsonMap
}

export enum Name {
  SESSION_START = 'Session Start',
  // Account creation
  // When the user opens the create account page
  CREATE_ACCOUNT_OPEN = 'Create Account: Open',
  // When the user continues past the email page
  CREATE_ACCOUNT_COMPLETE_EMAIL = 'Create Account: Complete Email',
  // When the user continues past the password page
  CREATE_ACCOUNT_COMPLETE_PASSWORD = 'Create Account: Complete Password',
  // When the user starts integrating with twitter
  CREATE_ACCOUNT_START_TWITTER = 'Create Account: Start Twitter',
  // When the user continues past the "twitter connection page"
  CREATE_ACCOUNT_COMPLETE_TWITTER = 'Create Account: Complete Twitter',
  // When the user starts integrating with instagram
  CREATE_ACCOUNT_START_INSTAGRAM = 'Create Account: Start Instagram',
  // When the user continues past the "instagram connection page"
  CREATE_ACCOUNT_COMPLETE_INSTAGRAM = 'Create Account: Complete Instagram',
  // When the user starts integrating with tiktok
  CREATE_ACCOUNT_START_TIKTOK = 'Create Account: Start TikTok',
  // When the user continues past the "tiktok connection page"
  CREATE_ACCOUNT_COMPLETE_TIKTOK = 'Create Account: Complete TikTok',
  // When the user continues past the "profile info page"
  CREATE_ACCOUNT_COMPLETE_PROFILE = 'Create Account: Complete Profile',
  // When the user continues past the follow page
  CREATE_ACCOUNT_COMPLETE_FOLLOW = 'Create Account: Complete Follow',
  // When the user continues past the loading page
  CREATE_ACCOUNT_COMPLETE_CREATING = 'Create Account: Complete Creating',
  // When the user continues past the entire signup modal
  CREATE_ACCOUNT_FINISH = 'Create Account: Finish',
  // When the user gets rate limited during signup auth
  CREATE_ACCOUNT_RATE_LIMIT = 'Create Account: Rate Limit',
  // When the user gets blocked by AAO during the signup path
  CREATE_ACCOUNT_BLOCKED = 'Create Account: Blocked',

  // Sign in
  SIGN_IN_OPEN = 'Sign In: Open',
  SIGN_IN_FINISH = 'Sign In: Finish',
  SIGN_IN_WITH_INCOMPLETE_ACCOUNT = 'Sign In: Incomplete Account',

  // Settings
  SETTINGS_CHANGE_THEME = 'Settings: Change Theme',
  SETTINGS_START_TWITTER_OAUTH = 'Settings: Start Twitter OAuth',
  SETTINGS_COMPLETE_TWITTER_OAUTH = 'Settings: Complete Twitter OAuth',
  SETTINGS_START_INSTAGRAM_OAUTH = 'Settings: Start Instagram OAuth',
  SETTINGS_COMPLETE_INSTAGRAM_OAUTH = 'Settings: Complete Instagram OAuth',
  SETTINGS_START_TIKTOK_OAUTH = 'Settings: Start TikTok OAuth',
  SETTINGS_COMPLETE_TIKTOK_OAUTH = 'Settings: Complete TikTok OAuth',
  SETTINGS_RESEND_ACCOUNT_RECOVERY = 'Settings: Resend Account Recovery',
  SETTINGS_START_CHANGE_PASSWORD = 'Settings: Start Change Password',
  SETTINGS_COMPLETE_CHANGE_PASSWORD = 'Settings: Complete Change Password',
  SETTINGS_LOG_OUT = 'Settings: Log Out',

  // TikTok
  TIKTOK_START_OAUTH = 'TikTok: Start TikTok OAuth',
  TIKTOK_COMPLETE_OAUTH = 'TikTok: Complete TikTok OAuth',
  TIKTOK_OAUTH_ERROR = 'TikTok: TikTok OAuth Error',
  TIKTOK_START_SHARE_SOUND = 'TikTok: Start Share Sound',
  TIKTOK_COMPLETE_SHARE_SOUND = 'TikTok: Complete Share Sound',
  TIKTOK_SHARE_SOUND_ERROR = 'TikTok: Share Sound Error',

  // Audius OAuth Login Page
  AUDIUS_OAUTH_START = 'Audius Oauth: Open Login (authenticate)',
  AUDIUS_OAUTH_SUBMIT = 'Audius Oauth: Submit Login (authenticate)',
  AUDIUS_OAUTH_COMPLETE = 'Audius Oauth: Login (authenticate) Success',
  AUDIUS_OAUTH_ERROR = 'Audius Oauth: Login (authenticate) Failed',

  // Developer app
  DEVELOPER_APP_CREATE_SUBMIT = 'Developer Apps: Create app submit',
  DEVELOPER_APP_CREATE_SUCCESS = 'Developer Apps: Create app success',
  DEVELOPER_APP_CREATE_ERROR = 'Developer Apps: Create app error',
  DEVELOPER_APP_DELETE_SUCCESS = 'Developer Apps: Delete app success',
  DEVELOPER_APP_DELETE_ERROR = 'Developer Apps: Delete app error',

  // Visualizer
  VISUALIZER_OPEN = 'Visualizer: Open',
  VISUALIZER_CLOSE = 'Visualizer: Close',

  // Profile completion
  ACCOUNT_HEALTH_METER_FULL = 'Account Health: Meter Full',
  ACCOUNT_HEALTH_UPLOAD_COVER_PHOTO = 'Account Health: Upload Cover Photo',
  ACCOUNT_HEALTH_UPLOAD_PROFILE_PICTURE = 'Account Health: Upload Profile Picture',
  ACCOUNT_HEALTH_DOWNLOAD_DESKTOP = 'Account Health: Download Desktop',
  ACCOUNT_HEALTH_CLICK_APP_CTA_BANNER = 'Account Health: App CTA Banner',

  // Social actions
  SHARE = 'Share',
  SHARE_TO_TWITTER = 'Share to Twitter',
  REPOST = 'Repost',
  UNDO_REPOST = 'Undo Repost',
  FAVORITE = 'Favorite',
  UNFAVORITE = 'Unfavorite',
  ARTIST_PICK_SELECT_TRACK = 'Artist Pick: Select Track',
  FOLLOW = 'Follow',
  UNFOLLOW = 'Unfollow',

  // Playlist creation
  PLAYLIST_ADD = 'Playlist: Add To Playlist',
  PLAYLIST_OPEN_CREATE = 'Playlist: Open Create Playlist',
  PLAYLIST_START_CREATE = 'Playlist: Start Create Playlist',
  PLAYLIST_COMPLETE_CREATE = 'Playlist: Complete Create Playlist',
  PLAYLIST_MAKE_PUBLIC = 'Playlist: Make Public',
  PLAYLIST_OPEN_EDIT_FROM_LIBRARY = 'Playlist: Open Edit Playlist From Sidebar',

  DELETE = 'Delete',

  // Folders
  FOLDER_OPEN_CREATE = 'Folder: Open Create Playlist Folder',
  FOLDER_SUBMIT_CREATE = 'Folder: Submit Create Playlist Folder',
  FOLDER_CANCEL_CREATE = 'Folder: Cancel Create Playlist Folder',
  FOLDER_OPEN_EDIT = 'Folder: Open Edit Playlist Folder',
  FOLDER_SUBMIT_EDIT = 'Folder: Submit Edit Playlist Folder',
  FOLDER_DELETE = 'Folder: Delete Playlist Folder',
  FOLDER_CANCEL_EDIT = 'Folder: Cancel Edit Playlist Folder',

  // Embed
  EMBED_OPEN = 'Embed: Open modal',
  EMBED_COPY = 'Embed: Copy',

  // Upload funnel / conversion
  TRACK_UPLOAD_OPEN = 'Track Upload: Open',
  TRACK_UPLOAD_START_UPLOADING = 'Track Upload: Start Upload',
  TRACK_UPLOAD_TRACK_UPLOADING = 'Track Upload: Track Uploading',
  // Note that upload is considered complete if it is explicitly rejected
  // by the node receiving the file (HTTP 403).
  TRACK_UPLOAD_COMPLETE_UPLOAD = 'Track Upload: Complete Upload',
  TRACK_UPLOAD_COPY_LINK = 'Track Upload: Copy Link',
  TRACK_UPLOAD_SHARE_WITH_FANS = 'Track Upload: Share with your fans',
  TRACK_UPLOAD_SHARE_SOUND_TO_TIKTOK = 'Track Upload: Share sound to TikTok',
  TRACK_UPLOAD_VIEW_TRACK_PAGE = 'Track Upload: View Track page',
  TWEET_FIRST_UPLOAD = 'Tweet First Upload',

  // Upload success tracking
  TRACK_UPLOAD_SUCCESS = 'Track Upload: Success',
  TRACK_UPLOAD_FAILURE = 'Track Upload: Failure',
  TRACK_UPLOAD_REJECTED = 'Track Upload: Rejected',

  // Gated Track Uploads
  TRACK_UPLOAD_COLLECTIBLE_GATED = 'Track Upload: Collectible Gated',
  TRACK_UPLOAD_FOLLOW_GATED = 'Track Upload: Follow Gated',
  TRACK_UPLOAD_TIP_GATED = 'Track Upload: Tip Gated',

  // Gated Track Listen
  LISTEN_GATED = 'Listen: Gated',

  // Unlocked Gated Tracks
  COLLECTIBLE_GATED_TRACK_UNLOCKED = 'Collectible Gated: Track Unlocked',
  FOLLOW_GATED_TRACK_UNLOCKED = 'Follow Gated: Track Unlocked',
  TIP_GATED_TRACK_UNLOCKED = 'Tip Gated: Track Unlocked',

  // Trending
  TRENDING_CHANGE_VIEW = 'Trending: Change view',
  TRENDING_PAGINATE = 'Trending: Fetch next page',

  // Feed
  FEED_CHANGE_VIEW = 'Feed: Change view',
  FEED_PAGINATE = 'Feed: Fetch next page',

  // Notifications
  NOTIFICATIONS_OPEN = 'Notifications: Open',
  NOTIFICATIONS_CLICK_TILE = 'Notifications: Clicked Tile',
  NOTIFICATIONS_CLICK_MILESTONE_TWITTER_SHARE = 'Notifications: Clicked Milestone Twitter Share',
  NOTIFICATIONS_CLICK_REMIX_CREATE_TWITTER_SHARE = 'Notifications: Clicked Remix Create Twitter Share',
  NOTIFICATIONS_CLICK_REMIX_COSIGN_TWITTER_SHARE = 'Notifications: Clicked Remix Co-Sign Twitter Share',
  NOTIFICATIONS_CLICK_TIP_REACTION_TWITTER_SHARE = 'Notifications: Clicked Tip Reaction Twitter Share',
  NOTIFICATIONS_CLICK_TIP_RECEIVED_TWITTER_SHARE = 'Notifications: Clicked Tip Received Twitter Share',
  NOTIFICATIONS_CLICK_TIP_SENT_TWITTER_SHARE = 'Notifications: Clicked Tip Sent Twitter Share',
  NOTIFICATIONS_CLICK_DETHRONED_TWITTER_SHARE = 'Notifications: Clicked Dethroned Twitter Share',
  NOTIFICATIONS_CLICK_SUPPORTER_RANK_UP_TWITTER_SHARE = 'Notifications: Clicked Supporter Rank Up Twitter Share',
  NOTIFICATIONS_CLICK_SUPPORTING_RANK_UP_TWITTER_SHARE = 'Notifications: Clicked Supporting Rank Up Twitter Share',
  NOTIFICATIONS_CLICK_TRENDING_TRACK_TWITTER_SHARE = 'Notifications: Clicked Trending Track Twitter Share',
  NOTIFICATIONS_CLICK_TRENDING_PLAYLIST_TWITTER_SHARE = 'Notifications: Clicked Trending Playlist Twitter Share',
  NOTIFICATIONS_CLICK_TRENDING_UNDERGROUND_TWITTER_SHARE = 'Notifications: Clicked Trending Underground Twitter Share',
  NOTIFICATIONS_CLICK_TASTEMAKER_TWITTER_SHARE = 'Notifications: Clicked Tastemaker Twitter Share',
  NOTIFICATIONS_CLICK_ADD_TRACK_TO_PLAYLIST_TWITTER_SHARE = 'Notifications: Clicked Add Track to Playlist Twitter Share',
  NOTIFICATIONS_CLICK_USDC_PURCHASE_TWITTER_SHARE = 'Notifications: Clicked USDC Purchase Twitter Share',
  NOTIFICATIONS_TOGGLE_SETTINGS = 'Notifications: Toggle Setting',
  BROWSER_NOTIFICATION_SETTINGS = 'Browser Push Notification',

  // Profile page
  PROFILE_PAGE_TAB_CLICK = 'Profile Page: Tab Click',
  PROFILE_PAGE_SORT = 'Profile Page: Sort',
  PROFILE_PAGE_CLICK_INSTAGRAM = 'Profile Page: Go To Instagram',
  PROFILE_PAGE_CLICK_TWITTER = 'Profile Page: Go To Twitter',
  PROFILE_PAGE_CLICK_TIKTOK = 'Profile Page: Go To TikTok',
  PROFILE_PAGE_CLICK_WEBSITE = 'ProfilePage: Go To Website',
  PROFILE_PAGE_CLICK_DONATION = 'ProfilePage: Go To Donation',
  PROFILE_PAGE_SHOWN_ARTIST_RECOMMENDATIONS = 'ProfilePage: Shown Artist Recommendations',

  // Track page
  TRACK_PAGE_DOWNLOAD = 'Track Page: Download',
  TRACK_PAGE_PLAY_MORE = 'Track Page: Play More By This Artist',

  // Playback
  PLAYBACK_PLAY = 'Playback: Play',
  PLAYBACK_PAUSE = 'Playback: Pause',
  // A listen is when we record against the backend vs. a play which is a UI action
  LISTEN = 'Listen',

  // Navigation
  PAGE_VIEW = 'Page View',
  ON_FIRST_PAGE = 'nav-on-first-page',
  NOT_ON_FIRST_PAGE = 'nav-not-on-first-page',
  LINK_CLICKING = 'Link Click',
  TAG_CLICKING = 'Tag Click',

  // Search
  SEARCH_SEARCH = 'Search: Search',
  SEARCH_TAG_SEARCH = 'Search: Tag Search',
  SEARCH_MORE_RESULTS = 'Search: More Results',
  SEARCH_RESULT_SELECT = 'Search: Result Select',
  SEARCH_TAB_CLICK = 'Search: Tab Click',

  // Errors
  ERROR_PAGE = 'Error Page',
  NOT_FOUND_PAGE = 'Not Found Page',

  // System
  WEB_VITALS = 'Web Vitals',
  PERFORMANCE = 'Performance',
  DISCOVERY_PROVIDER_SELECTION = 'Discovery Provider Selection',
  CREATOR_NODE_SELECTION = 'Creator Node Selection',

  // Remixes
  STEM_COMPLETE_UPLOAD = 'Stem: Complete Upload',
  STEM_DELETE = 'Stem: Delete',
  REMIX_NEW_REMIX = 'Remix: New Remix',
  REMIX_COSIGN = 'Remix: CoSign',
  REMIX_COSIGN_INDICATOR = 'Remix: CoSign Indicator',
  REMIX_HIDE = 'Remix: Hide',

  // $AUDIO
  SEND_AUDIO_REQUEST = 'Send $AUDIO: Request',
  SEND_AUDIO_SUCCESS = 'Send $AUDIO: Success',
  SEND_AUDIO_FAILURE = 'Send $AUDIO: Failure',

  // AUDIO Manager
  TRANSFER_AUDIO_TO_WAUDIO_REQUEST = 'TRANSFER_AUDIO_TO_WAUDIO_REQUEST',
  TRANSFER_AUDIO_TO_WAUDIO_SUCCESS = 'TRANSFER_AUDIO_TO_WAUDIO_SUCCESS',
  TRANSFER_AUDIO_TO_WAUDIO_FAILURE = 'TRANSFER_AUDIO_TO_WAUDIO_FAILURE',

  // Service monitoring
  SERVICE_MONITOR_REQUEST = 'Service Monitor: Request',
  SERVICE_MONITOR_HEALTH_CHECK = 'Service Monitor: Status',

  // Playlist library
  PLAYLIST_LIBRARY_REORDER = 'Playlist Library: Reorder',
  PLAYLIST_LIBRARY_MOVE_PLAYLIST_INTO_FOLDER = 'Playlist Library: Move Playlist Into Folder',
  PLAYLIST_LIBRARY_ADD_PLAYLIST_TO_FOLDER = 'Playlist Library: Add Playlist To Folder',
  PLAYLIST_LIBRARY_MOVE_PLAYLIST_OUT_OF_FOLDER = 'Playlist Library: Move Playlist Out of Folder',
  PLAYLIST_LIBRARY_EXPAND_FOLDER = 'Playlist Library: Expand Folder',
  PLAYLIST_LIBRARY_COLLAPSE_FOLDER = 'Playlist Library: Collapse Folder',
  // When an update is available in the playlist library
  PLAYLIST_LIBRARY_HAS_UPDATE = 'Playlist Library: Has Update',
  // When a user clicks on a playlist in the library
  PLAYLIST_LIBRARY_CLICKED = 'Playlist Library: Clicked',

  // Deactivate Account
  DEACTIVATE_ACCOUNT_PAGE_VIEW = 'Deactivate Account: Page View',
  DEACTIVATE_ACCOUNT_REQUEST = 'Deactivate Account: Request',
  DEACTIVATE_ACCOUNT_SUCCESS = 'Deactivate Account: Success',
  DEACTIVATE_ACCOUNT_FAILURE = 'Deactivate Account: Failure',

  // Create User Bank
  CREATE_USER_BANK_REQUEST = 'Create User Bank: Request',
  CREATE_USER_BANK_SUCCESS = 'Create User Bank: Success',
  CREATE_USER_BANK_FAILURE = 'Create User Bank: Failure',

  // Rewards
  REWARDS_CLAIM_START = 'Rewards Claim: Start Claim',
  REWARDS_CLAIM_SUCCESS = 'Rewards Claim: Success',
  REWARDS_CLAIM_RETRY = 'Rewards Claim: Retry',
  REWARDS_CLAIM_FAILURE = 'Rewards Claim: Failure',
  REWARDS_CLAIM_HCAPTCHA = 'Rewards Claim: Hcaptcha',
  REWARDS_CLAIM_REJECTION = 'Rewards Claim: Rejection',
  REWARDS_CLAIM_UNKNOWN = 'Rewards Claim: Unknown',

  // Tipping
  TIP_AUDIO_REQUEST = 'Tip Audio: Request',
  TIP_AUDIO_SUCCESS = 'Tip Audio: Success',
  TIP_AUDIO_FAILURE = 'Tip Audio: Failure',
  TIP_AUDIO_TWITTER_SHARE = 'Tip Audio: Twitter Share',
  TIP_FEED_TILE_DISMISS = 'Tip Feed Tile: Dismiss',

  // Social Proof
  SOCIAL_PROOF_OPEN = 'Social Proof: Open',
  SOCIAL_PROOF_SUCCESS = 'Social Proof: Success',
  SOCIAL_PROOF_ERROR = 'Social Proof: Error',

  // Buy Audio
  BUY_AUDIO_ON_RAMP_OPENED = 'Buy Audio: On Ramp Opened',
  BUY_AUDIO_ON_RAMP_CANCELED = 'Buy Audio: On Ramp Canceled',
  BUY_AUDIO_ON_RAMP_SUCCESS = 'Buy Audio: On Ramp Success',
  BUY_AUDIO_SUCCESS = 'Buy Audio: Success',
  BUY_AUDIO_FAILURE = 'Buy Audio: Failure',

  // Buy Audio Recovery
  BUY_AUDIO_RECOVERY_OPENED = 'Buy Audio Recovery: Opened',
  BUY_AUDIO_RECOVERY_SUCCESS = 'Buy Audio Recovery: Success',
  BUY_AUDIO_RECOVERY_FAILURE = 'Buy Audio Recovery: Failure',

  // Buy USDC
  BUY_USDC_ON_RAMP_OPENED = 'Buy USDC: On Ramp Opened',
  BUY_USDC_ON_RAMP_CANCELED = 'Buy USDC: On Ramp Canceled',
  BUY_USDC_ON_RAMP_SUCCESS = 'Buy USDC: On Ramp Success',
  BUY_USDC_SUCCESS = 'Buy USDC: Success',
  BUY_USDC_FAILURE = 'Buy USDC: Failure',

  // Purchase Content
  PURCHASE_CONTENT_STARTED = 'Purchase Content: Started',
  PURCHASE_CONTENT_SUCCESS = 'Purchase Content: Success',
  PURCHASE_CONTENT_FAILURE = 'Purchase Content: Failure',

  // Rate & Review CTA
  RATE_CTA_DISPLAYED = 'Rate CTA: Displayed',
  RATE_CTA_RESPONSE_YES = 'Rate CTA: User Responded Yes',
  RATE_CTA_RESPONSE_NO = 'Rate CTA: User Responded No',

  // Connect Wallet
  CONNECT_WALLET_NEW_WALLET_START = 'Connect Wallet: New Wallet Start',
  CONNECT_WALLET_NEW_WALLET_CONNECTING = 'Connect Wallet: New Wallet Connecting',
  CONNECT_WALLET_NEW_WALLET_CONNECTED = 'Connect Wallet: New Wallet Connected',
  CONNECT_WALLET_ALREADY_ASSOCIATED = 'Connect Wallet: Already Associated',
  CONNECT_WALLET_ASSOCIATION_ERROR = 'Connect Wallet: Association Error',
  CONNECT_WALLET_ERROR = 'Connect Wallet: Error',

  // Chat
  CREATE_CHAT_SUCCESS = 'Create Chat: Success',
  CREATE_CHAT_FAILURE = 'Create Chat: Failure',
  SEND_MESSAGE_SUCCESS = 'Send Message: Success',
  SEND_MESSAGE_FAILURE = 'Send Message: Failure',
  DELETE_CHAT_SUCCESS = 'Delete Chat: Success',
  DELETE_CHAT_FAILURE = 'Delete Chat: Failure',
  BLOCK_USER_SUCCESS = 'Block User: Success',
  BLOCK_USER_FAILURE = 'Block User: Failure',
  CHANGE_INBOX_SETTINGS_SUCCESS = 'Change Inbox Settings: Success',
  CHANGE_INBOX_SETTINGS_FAILURE = 'Change Inbox Settings: Failure',
  SEND_MESSAGE_REACTION_SUCCESS = 'Send Message Reaction: Success',
  SEND_MESSAGE_REACTION_FAILURE = 'Send Message Reaction: Failure',
  MESSAGE_UNFURL_TRACK = 'Message Unfurl: Track',
  MESSAGE_UNFURL_PLAYLIST = 'Message Unfurl: Playlist',
  TIP_UNLOCKED_CHAT = 'Unlocked Chat: Tip',
  CHAT_REPORT_USER = 'Report User: Chat',
  CHAT_ENTRY_POINT = 'Chat Entry Point'
}

type PageView = {
  eventName: Name.PAGE_VIEW
  route: string
}

// Create Account
export type CreateAccountOpen = {
  eventName: Name.CREATE_ACCOUNT_OPEN
  source:
    | 'nav profile'
    | 'nav button'
    | 'landing page'
    | 'account icon'
    | 'social action'
    | 'sign in page'
    | 'restricted page'
}
type CreateAccountCompleteEmail = {
  eventName: Name.CREATE_ACCOUNT_COMPLETE_EMAIL
  emailAddress: string
}
type CreateAccountCompletePassword = {
  eventName: Name.CREATE_ACCOUNT_COMPLETE_PASSWORD
  emailAddress: string
}
type CreateAccountStartTwitter = {
  eventName: Name.CREATE_ACCOUNT_START_TWITTER
  emailAddress: string
}
type CreateAccountCompleteTwitter = {
  eventName: Name.CREATE_ACCOUNT_COMPLETE_TWITTER
  isVerified: boolean
  emailAddress: string
  handle: string
}
type CreateAccountStartInstagram = {
  eventName: Name.CREATE_ACCOUNT_START_INSTAGRAM
  emailAddress: string
}
type CreateAccountCompleteInstagram = {
  eventName: Name.CREATE_ACCOUNT_COMPLETE_INSTAGRAM
  isVerified: boolean
  emailAddress: string
  handle: string
}
type CreateAccountStartTikTok = {
  eventName: Name.CREATE_ACCOUNT_START_TIKTOK
  emailAddress: string
}
type CreateAccountCompleteTikTok = {
  eventName: Name.CREATE_ACCOUNT_COMPLETE_TIKTOK
  emailAddress: string
}
type CreateAccountCompleteProfile = {
  eventName: Name.CREATE_ACCOUNT_COMPLETE_PROFILE
  emailAddress: string
  handle: string
}
type CreateAccountCompleteFollow = {
  eventName: Name.CREATE_ACCOUNT_COMPLETE_FOLLOW
  emailAddress: string
  handle: string
  users: string
  count: number
}
type CreateAccountCompleteCreating = {
  eventName: Name.CREATE_ACCOUNT_COMPLETE_CREATING
  emailAddress: string
  handle: string
}
type CreateAccountOpenFinish = {
  eventName: Name.CREATE_ACCOUNT_FINISH
  emailAddress: string
  handle: string
}

// Sign In
type SignInOpen = {
  eventName: Name.SIGN_IN_OPEN
  source: 'sign up page'
}
type SignInFinish = {
  eventName: Name.SIGN_IN_FINISH
  status: 'success' | 'invalid credentials'
}

type SignInWithIncompleteAccount = {
  eventName: Name.SIGN_IN_WITH_INCOMPLETE_ACCOUNT
  handle: string
}

// Settings
type SettingsChangeTheme = {
  eventName: Name.SETTINGS_CHANGE_THEME
  mode: 'dark' | 'light' | 'matrix' | 'auto'
}
type SettingsStartTwitterOauth = {
  eventName: Name.SETTINGS_START_TWITTER_OAUTH
  handle: string
}
type SettingsCompleteTwitterOauth = {
  eventName: Name.SETTINGS_COMPLETE_TWITTER_OAUTH
  handle: string
  screen_name: string
  is_verified: boolean
}
type SettingsStartInstagramOauth = {
  eventName: Name.SETTINGS_START_INSTAGRAM_OAUTH
  handle: string
}
type SettingsCompleteInstagramOauth = {
  eventName: Name.SETTINGS_COMPLETE_INSTAGRAM_OAUTH
  handle: string
  username: string
  is_verified: boolean
}
type SettingsStartTikTokOauth = {
  eventName: Name.SETTINGS_START_TIKTOK_OAUTH
  handle: string
}
type SettingsCompleteTikTokOauth = {
  eventName: Name.SETTINGS_COMPLETE_TIKTOK_OAUTH
  handle: string
  username: string
  is_verified: boolean
}
type SettingsResetAccountRecovery = {
  eventName: Name.SETTINGS_RESEND_ACCOUNT_RECOVERY
}
type SettingsStartChangePassword = {
  eventName: Name.SETTINGS_START_CHANGE_PASSWORD
}
type SettingsCompleteChangePassword = {
  eventName: Name.SETTINGS_COMPLETE_CHANGE_PASSWORD
  status: 'success' | 'failure'
}
type SettingsLogOut = {
  eventName: Name.SETTINGS_LOG_OUT
}

// TikTok
type TikTokStartOAuth = {
  eventName: Name.TIKTOK_START_OAUTH
}

type TikTokCompleteOAuth = {
  eventName: Name.TIKTOK_COMPLETE_OAUTH
}

type TikTokOAuthError = {
  eventName: Name.TIKTOK_OAUTH_ERROR
  error: string
}

type TikTokStartShareSound = {
  eventName: Name.TIKTOK_START_SHARE_SOUND
}

type TikTokCompleteShareSound = {
  eventName: Name.TIKTOK_COMPLETE_SHARE_SOUND
}

type TikTokShareSoundError = {
  eventName: Name.TIKTOK_SHARE_SOUND_ERROR
  error: string
}

// Error
type ErrorPage = {
  eventName: Name.ERROR_PAGE
  error: string
  name: string
  route?: string
}
type NotFoundPage = {
  eventName: Name.NOT_FOUND_PAGE
}

// Visualizer
type VisualizerOpen = {
  eventName: Name.VISUALIZER_OPEN
}
type VisualizerClose = {
  eventName: Name.VISUALIZER_CLOSE
}

type AccountHealthMeterFull = {
  eventName: Name.ACCOUNT_HEALTH_METER_FULL
}
type AccountHealthUploadCoverPhoto = {
  eventName: Name.ACCOUNT_HEALTH_UPLOAD_COVER_PHOTO
  source: 'original' | 'unsplash' | 'url'
}
type AccountHealthUploadProfilePhoto = {
  eventName: Name.ACCOUNT_HEALTH_UPLOAD_PROFILE_PICTURE
  source: 'original' | 'unsplash' | 'url'
}
type AccountHealthDownloadDesktop = {
  eventName: Name.ACCOUNT_HEALTH_DOWNLOAD_DESKTOP
  source: 'banner' | 'settings'
}

type AccountHealthCTABanner = {
  eventName: Name.ACCOUNT_HEALTH_CLICK_APP_CTA_BANNER
}

// Social
export enum ShareSource {
  TILE = 'tile',
  PAGE = 'page',
  NOW_PLAYING = 'now playing',
  OVERFLOW = 'overflow',
  LEFT_NAV = 'left-nav',
  UPLOAD = 'upload'
}
export enum RepostSource {
  TILE = 'tile',
  PLAYBAR = 'playbar',
  NOW_PLAYING = 'now playing',
  TRACK_PAGE = 'page',
  COLLECTION_PAGE = 'collection page',
  HISTORY_PAGE = 'history page',
  FAVORITES_PAGE = 'favorites page',
  OVERFLOW = 'overflow',
  TRACK_LIST = 'track list'
}
export enum FavoriteSource {
  TILE = 'tile',
  PLAYBAR = 'playbar',
  NOW_PLAYING = 'now playing',
  TRACK_PAGE = 'page',
  COLLECTION_PAGE = 'collection page',
  HISTORY_PAGE = 'history page',
  FAVORITES_PAGE = 'favorites page',
  OVERFLOW = 'overflow',
  TRACK_LIST = 'track list',
  SIGN_UP = 'sign up',
  OFFLINE_DOWNLOAD = 'offline download',
  // Favorite triggered by some implicit action, e.g.
  // you had a smart collection and it was favorited so it
  // shows in your left-nav.
  IMPLICIT = 'implicit',
  NAVIGATOR = 'navigator'
}
export enum FollowSource {
  PROFILE_PAGE = 'profile page',
  TRACK_PAGE = 'track page',
  COLLECTION_PAGE = 'collection page',
  HOVER_TILE = 'hover tile',
  OVERFLOW = 'overflow',
  USER_LIST = 'user list',
  ARTIST_RECOMMENDATIONS_POPUP = 'artist recommendations popup',
  EMPTY_FEED = 'empty feed',
  HOW_TO_UNLOCK_TRACK_PAGE = 'how to unlock track page',
  HOW_TO_UNLOCK_MODAL = 'how to unlock modal'
}

type Share = {
  eventName: Name.SHARE
  kind: 'profile' | 'album' | 'playlist' | 'track'
  source: ShareSource
  id: string
  url: string
}

export type ShareToTwitter = {
  eventName: Name.SHARE_TO_TWITTER
  kind: 'profile' | 'album' | 'playlist' | 'track' | 'audioNftPlaylist'
  source: ShareSource
  id: number
  url: string
}

type Repost = {
  eventName: Name.REPOST
  kind: PlayableType
  source: RepostSource
  id: string
}
type UndoRepost = {
  eventName: Name.UNDO_REPOST
  kind: PlayableType
  source: RepostSource
  id: string
}
type Favorite = {
  eventName: Name.FAVORITE
  kind: PlayableType
  source: FavoriteSource
  id: string
}
type Unfavorite = {
  eventName: Name.UNFAVORITE
  kind: PlayableType
  source: FavoriteSource
  id: string
}
type ArtistPickSelectTrack = {
  eventName: Name.ARTIST_PICK_SELECT_TRACK
  id: string
}
type Follow = {
  eventName: Name.FOLLOW
  id: string
  source: FollowSource
}
type Unfollow = {
  eventName: Name.UNFOLLOW
  id: string
  source: FollowSource
}
type TweetFirstUpload = {
  eventName: Name.TWEET_FIRST_UPLOAD
  handle: string
}

// Playlist
export enum CreatePlaylistSource {
  NAV = 'nav',
  CREATE_PAGE = 'create page',
  FROM_TRACK = 'from track',
  FAVORITES_PAGE = 'favorites page',
  PROFILE_PAGE = 'profile page'
}

type PlaylistAdd = {
  eventName: Name.PLAYLIST_ADD
  trackId: string
  playlistId: string
}
type PlaylistOpenCreate = {
  eventName: Name.PLAYLIST_OPEN_CREATE
  source: CreatePlaylistSource
}
type PlaylistStartCreate = {
  eventName: Name.PLAYLIST_START_CREATE
  source: CreatePlaylistSource
  artworkSource: 'unsplash' | 'original'
}
type PlaylistCompleteCreate = {
  eventName: Name.PLAYLIST_COMPLETE_CREATE
  source: CreatePlaylistSource
  status: 'success' | 'failure'
}
type PlaylistMakePublic = {
  eventName: Name.PLAYLIST_MAKE_PUBLIC
  id: string
}

type PlaylistOpenEditFromLibrary = {
  eventName: Name.PLAYLIST_OPEN_EDIT_FROM_LIBRARY
}

type Delete = {
  eventName: Name.DELETE
  kind: PlayableType
  id: string
}

// Folder

type FolderOpenCreate = {
  eventName: Name.FOLDER_OPEN_CREATE
}

type FolderSubmitCreate = {
  eventName: Name.FOLDER_SUBMIT_CREATE
}

type FolderCancelCreate = {
  eventName: Name.FOLDER_CANCEL_CREATE
}

type FolderOpenEdit = {
  eventName: Name.FOLDER_OPEN_EDIT
}

type FolderSubmitEdit = {
  eventName: Name.FOLDER_SUBMIT_EDIT
}

type FolderDelete = {
  eventName: Name.FOLDER_DELETE
}

type FolderCancelEdit = {
  eventName: Name.FOLDER_CANCEL_EDIT
}

// Embed
type EmbedOpen = {
  eventName: Name.EMBED_OPEN
  kind: PlayableType
  id: string
}
type EmbedCopy = {
  eventName: Name.EMBED_COPY
  kind: PlayableType
  id: string
  size: 'card' | 'compact' | 'tiny'
}

// Track Upload
type TrackUploadOpen = {
  eventName: Name.TRACK_UPLOAD_OPEN
  source: 'nav' | 'profile' | 'signup'
}
type TrackUploadStartUploading = {
  eventName: Name.TRACK_UPLOAD_START_UPLOADING
  count: number
  kind: 'tracks' | 'album' | 'playlist'
}
type TrackUploadTrackUploading = {
  eventName: Name.TRACK_UPLOAD_TRACK_UPLOADING
  artworkSource: 'unsplash' | 'original'
  genre: string
  mood: string
  downloadable: 'yes' | 'no' | 'follow'
  size: number
  type: string
  name: string
}
type TrackUploadCompleteUpload = {
  eventName: Name.TRACK_UPLOAD_COMPLETE_UPLOAD
  count: number
  kind: 'tracks' | 'album' | 'playlist'
}

type TrackUploadSuccess = {
  eventName: Name.TRACK_UPLOAD_SUCCESS
  endpoint: string
  kind: 'single_track' | 'multi_track' | 'album' | 'playlist'
}

type TrackUploadFailure = {
  eventName: Name.TRACK_UPLOAD_FAILURE
  endpoint: string
  kind: 'single_track' | 'multi_track' | 'album' | 'playlist'
  error?: string
}

type TrackUploadRejected = {
  eventName: Name.TRACK_UPLOAD_REJECTED
  endpoint: string
  kind: 'single_track' | 'multi_track' | 'album' | 'playlist'
  error?: string
}

type TrackUploadCopyLink = {
  eventName: Name.TRACK_UPLOAD_COPY_LINK
  uploadType: string
  url: string
}
type TrackUploadShareWithFans = {
  eventName: Name.TRACK_UPLOAD_SHARE_WITH_FANS
  uploadType: string
  text: string
}
type TrackUploadShareSoundToTikTok = {
  eventName: Name.TRACK_UPLOAD_SHARE_SOUND_TO_TIKTOK
}
type TrackUploadViewTrackPage = {
  eventName: Name.TRACK_UPLOAD_VIEW_TRACK_PAGE
  uploadType: string
}

// Gated Track Uploads
type TrackUploadCollectibleGated = {
  eventName: Name.TRACK_UPLOAD_COLLECTIBLE_GATED
  count: number
  kind: 'tracks'
}

type TrackUploadFollowGated = {
  eventName: Name.TRACK_UPLOAD_FOLLOW_GATED
  count: number
  kind: 'tracks'
}

type TrackUploadTipGated = {
  eventName: Name.TRACK_UPLOAD_TIP_GATED
  count: number
  kind: 'tracks'
}

// Unlocked Gated Tracks
type CollectibleGatedTrackUnlocked = {
  eventName: Name.COLLECTIBLE_GATED_TRACK_UNLOCKED
  count: number
}

type FollowGatedTrackUnlocked = {
  eventName: Name.FOLLOW_GATED_TRACK_UNLOCKED
  trackId: number
}

type TipGatedTrackUnlocked = {
  eventName: Name.TIP_GATED_TRACK_UNLOCKED
  trackId: number
}

// Trending
type TrendingChangeView = {
  eventName: Name.TRENDING_CHANGE_VIEW
  timeframe: TimeRange
  genre: string
}
type TrendingPaginate = {
  eventName: Name.TRENDING_PAGINATE
  offset: number
  limit: number
}

// Feed
type FeedChangeView = {
  eventName: Name.FEED_CHANGE_VIEW
  view: FeedFilter
}
type FeedPaginate = {
  eventName: Name.FEED_PAGINATE
  offset: number
  limit: number
}

// Notifications
type NotificationsOpen = {
  eventName: Name.NOTIFICATIONS_OPEN
  source: 'button' | 'push notifications'
}
type NotificationsClickTile = {
  eventName: Name.NOTIFICATIONS_CLICK_TILE
  kind: string
  link_to: string
}
type NotificationsClickMilestone = {
  eventName: Name.NOTIFICATIONS_CLICK_MILESTONE_TWITTER_SHARE
  milestone: string
}
type NotificationsClickRemixCreate = {
  eventName: Name.NOTIFICATIONS_CLICK_REMIX_CREATE_TWITTER_SHARE
  text: string
}
type NotificationsClickRemixCosign = {
  eventName: Name.NOTIFICATIONS_CLICK_REMIX_COSIGN_TWITTER_SHARE
  text: string
}
type NotificationsClickTipReaction = {
  eventName: Name.NOTIFICATIONS_CLICK_TIP_REACTION_TWITTER_SHARE
  text: string
}
type NotificationsClickTipReceived = {
  eventName: Name.NOTIFICATIONS_CLICK_TIP_RECEIVED_TWITTER_SHARE
  text: string
}
type NotificationsClickTipSent = {
  eventName: Name.NOTIFICATIONS_CLICK_TIP_SENT_TWITTER_SHARE
  text: string
}
type NotificationsClickDethroned = {
  eventName: Name.NOTIFICATIONS_CLICK_DETHRONED_TWITTER_SHARE
  text: string
}
type NotificationsClickSupporterRankUp = {
  eventName: Name.NOTIFICATIONS_CLICK_SUPPORTER_RANK_UP_TWITTER_SHARE
  text: string
}
type NotificationsClickSupportingRankUp = {
  eventName: Name.NOTIFICATIONS_CLICK_SUPPORTING_RANK_UP_TWITTER_SHARE
  text: string
}
type NotificationsClickAddTrackToPlaylist = {
  eventName: Name.NOTIFICATIONS_CLICK_ADD_TRACK_TO_PLAYLIST_TWITTER_SHARE
  text: string
}
type NotificationsClickUSDCPurchaseBuyer = {
  eventName: Name.NOTIFICATIONS_CLICK_USDC_PURCHASE_TWITTER_SHARE
  text: string
}
type NotificationsClickTrendingTrack = {
  eventName: Name.NOTIFICATIONS_CLICK_TRENDING_TRACK_TWITTER_SHARE
  text: string
}
type NotificationsClickTrendingPlaylist = {
  eventName: Name.NOTIFICATIONS_CLICK_TRENDING_PLAYLIST_TWITTER_SHARE
  text: string
}
type NotificationsClickTrendingUnderground = {
  eventName: Name.NOTIFICATIONS_CLICK_TRENDING_UNDERGROUND_TWITTER_SHARE
  text: string
}
type NotificationsClickTastemaker = {
  eventName: Name.NOTIFICATIONS_CLICK_TASTEMAKER_TWITTER_SHARE
  text: string
}
type NotificationsToggleSettings = {
  eventName: Name.NOTIFICATIONS_TOGGLE_SETTINGS
  settings: string
  enabled: boolean
}

// Profile
type ProfilePageTabClick = {
  eventName: Name.PROFILE_PAGE_TAB_CLICK
  tab: 'tracks' | 'albums' | 'reposts' | 'playlists' | 'collectibles'
}
type ProfilePageSort = {
  eventName: Name.PROFILE_PAGE_SORT
  sort: 'recent' | 'popular'
}
type ProfilePageClickInstagram = {
  eventName: Name.PROFILE_PAGE_CLICK_INSTAGRAM
  handle: string
  instagramHandle: string
}
type ProfilePageClickTwitter = {
  eventName: Name.PROFILE_PAGE_CLICK_TWITTER
  handle: string
  twitterHandle: string
}
type ProfilePageClickTikTok = {
  eventName: Name.PROFILE_PAGE_CLICK_TIKTOK
  handle: string
  tikTokHandle: string
}
type ProfilePageClickWebsite = {
  eventName: Name.PROFILE_PAGE_CLICK_WEBSITE
  handle: string
  website: string
}
type ProfilePageClickDonation = {
  eventName: Name.PROFILE_PAGE_CLICK_DONATION
  handle: string
  donation: string
}
type ProfilePageShownArtistRecommendations = {
  eventName: Name.PROFILE_PAGE_SHOWN_ARTIST_RECOMMENDATIONS
  userId: number
}

// Track Page
type TrackPageDownload = {
  eventName: Name.TRACK_PAGE_DOWNLOAD
  id: ID
  category?: string
  parent_track_id?: ID
}
type TrackPagePlayMore = {
  eventName: Name.TRACK_PAGE_PLAY_MORE
  id: ID
}

// Playback
export enum PlaybackSource {
  PLAYBAR = 'playbar',
  NOW_PLAYING = 'now playing',
  PLAYLIST_PAGE = 'playlist page',
  TRACK_PAGE = 'track page',
  TRACK_TILE = 'track tile',
  PLAYLIST_TRACK = 'playlist page track list',
  PLAYLIST_TILE_TRACK = 'playlist track tile',
  HISTORY_PAGE = 'history page',
  FAVORITES_PAGE = 'favorites page',
  PASSIVE = 'passive',
  EMBED_PLAYER = 'embed player',
  CHAT_TRACK = 'chat_track',
  CHAT_PLAYLIST_TRACK = 'chat_playlist_track'
}

type PlaybackPlay = {
  eventName: Name.PLAYBACK_PLAY
  id?: string
  source: PlaybackSource
}
type PlaybackPause = {
  eventName: Name.PLAYBACK_PAUSE
  id?: string
  source: PlaybackSource
}

// Linking
type LinkClicking = {
  eventName: Name.LINK_CLICKING
  url: string
  source: 'profile page' | 'track page' | 'collection page'
}
type TagClicking = {
  eventName: Name.TAG_CLICKING
  tag: string
  source: 'profile page' | 'track page' | 'collection page'
}

// Search
type SearchTerm = {
  eventName: Name.SEARCH_SEARCH
  term: string
  source: 'autocomplete' | 'search results page' | 'more results page'
}

type SearchTag = {
  eventName: Name.SEARCH_TAG_SEARCH
  tag: string
  source: 'autocomplete' | 'search results page' | 'more results page'
}

type SearchMoreResults = {
  eventName: Name.SEARCH_MORE_RESULTS
  term: string
  source: 'autocomplete' | 'search results page' | 'more results page'
}

type SearchResultSelect = {
  eventName: Name.SEARCH_RESULT_SELECT
  term: string
  source: 'autocomplete' | 'search results page' | 'more results page'
  id: ID
  kind: 'track' | 'profile' | 'playlist' | 'album'
}

type SearchTabClick = {
  eventName: Name.SEARCH_TAB_CLICK
  term: string
  tab: 'people' | 'tracks' | 'albums' | 'playlists'
}
type Listen = {
  eventName: Name.LISTEN
  trackId: string
}

type ListenGated = {
  eventName: Name.LISTEN_GATED
  trackId: string
}

type OnFirstPage = {
  eventName: Name.ON_FIRST_PAGE
}

type NotOnFirstPage = {
  eventName: Name.NOT_ON_FIRST_PAGE
}

type BrowserNotificationSetting = {
  eventName: Name.BROWSER_NOTIFICATION_SETTINGS
  provider: 'safari' | 'gcm'
  enabled: boolean
}

type WebVitals = {
  eventName: Name.WEB_VITALS
  metric: string
  value: number
  route: string
}

type Performance = {
  eventName: Name.PERFORMANCE
  metric: string
  value: number
}

type DiscoveryProviderSelection = {
  eventName: Name.DISCOVERY_PROVIDER_SELECTION
  endpoint: string
  reason: string
}

type StemCompleteUpload = {
  eventName: Name.STEM_COMPLETE_UPLOAD
  id: number
  parent_track_id: number
  category: string
}

type StemDelete = {
  eventName: Name.STEM_DELETE
  id: number
  parent_track_id: number
}

type RemixNewRemix = {
  eventName: Name.REMIX_NEW_REMIX
  id: number
  handle: string
  title: string
  parent_track_id: number
  parent_track_title: string
  parent_track_user_handle: string
}

type RemixCosign = {
  eventName: Name.REMIX_COSIGN
  id: number
  handle: string
  action: 'reposted' | 'favorited'
  original_track_id: number
  original_track_title: string
}

type RemixCosignIndicator = {
  eventName: Name.REMIX_COSIGN_INDICATOR
  id: number
  handle: string
  action: 'reposted' | 'favorited'
  original_track_id: number
  original_track_title: string
}

type RemixHide = {
  eventName: Name.REMIX_HIDE
  id: number
  handle: string
}

type SendAudioRequest = {
  eventName: Name.SEND_AUDIO_REQUEST
  from: WalletAddress
  recipient: WalletAddress
}

type SendAudioSuccess = {
  eventName: Name.SEND_AUDIO_SUCCESS
  from: WalletAddress
  recipient: WalletAddress
}

type SendAudioFailure = {
  eventName: Name.SEND_AUDIO_FAILURE
  from: WalletAddress
  recipient: WalletAddress
  error: string
}

type TransferAudioToWAudioRequest = {
  eventName: Name.TRANSFER_AUDIO_TO_WAUDIO_REQUEST
  from: WalletAddress
}

type TransferAudioToWAudioSuccess = {
  eventName: Name.TRANSFER_AUDIO_TO_WAUDIO_SUCCESS
  from: WalletAddress
  txSignature: string
  logs: string
}

type TransferAudioToWAudioFailure = {
  eventName: Name.TRANSFER_AUDIO_TO_WAUDIO_FAILURE
  from: WalletAddress
}

type ServiceMonitorRequest = {
  eventName: Name.SERVICE_MONITOR_REQUEST
  type: ServiceMonitorType
} & MonitorPayload

type ServiceMonitorHealthCheck = {
  eventName: Name.SERVICE_MONITOR_HEALTH_CHECK
  type: ServiceMonitorType
} & MonitorPayload

type PlaylistLibraryReorder = {
  eventName: Name.PLAYLIST_LIBRARY_REORDER
  // Whether or not the reorder contains newly created temp playlists
  containsTemporaryPlaylists: boolean
  kind: PlaylistLibraryKind
}

type PlaylistLibraryHasUpdate = {
  eventName: Name.PLAYLIST_LIBRARY_HAS_UPDATE
  count: number
}

type PlaylistLibraryClicked = {
  eventName: Name.PLAYLIST_LIBRARY_CLICKED
  playlistId: ID
  hasUpdate: boolean
}

type PlaylistLibraryMovePlaylistIntoFolder = {
  eventName: Name.PLAYLIST_LIBRARY_MOVE_PLAYLIST_INTO_FOLDER
}

type PlaylistLibraryAddPlaylistToFolder = {
  eventName: Name.PLAYLIST_LIBRARY_ADD_PLAYLIST_TO_FOLDER
}

type PlaylistLibraryMovePlaylistOutOfFolder = {
  eventName: Name.PLAYLIST_LIBRARY_MOVE_PLAYLIST_OUT_OF_FOLDER
}

type PlaylistLibraryExpandFolder = {
  eventName: Name.PLAYLIST_LIBRARY_EXPAND_FOLDER
}

type PlaylistLibraryCollapseFolder = {
  eventName: Name.PLAYLIST_LIBRARY_COLLAPSE_FOLDER
}

type DeactivateAccountPageView = {
  eventName: Name.DEACTIVATE_ACCOUNT_PAGE_VIEW
}
type DeactivateAccountRequest = {
  eventName: Name.DEACTIVATE_ACCOUNT_REQUEST
}
type DeactivateAccountSuccess = {
  eventName: Name.DEACTIVATE_ACCOUNT_SUCCESS
}
type DeactivateAccountFailure = {
  eventName: Name.DEACTIVATE_ACCOUNT_FAILURE
}

type CreateUserBankRequest = {
  eventName: Name.CREATE_USER_BANK_REQUEST
  userId: ID
}

type CreateUserBankSuccess = {
  eventName: Name.CREATE_USER_BANK_SUCCESS
  userId: ID
}

type CreateUserBankFailure = {
  eventName: Name.CREATE_USER_BANK_FAILURE
  userId: ID
  errorCode: string
  error: string
}

type RewardsClaimStart = {
  eventName: Name.REWARDS_CLAIM_START
  userId: string
  challengeId: string
  specifier: string
  amount: number
  source: string
}

type RewardsClaimSuccess = {
  eventName: Name.REWARDS_CLAIM_SUCCESS
  userId: string
  challengeId: string
  specifier: string
  amount: number
  source: string
}

type RewardsClaimRetry = {
  eventName: Name.REWARDS_CLAIM_RETRY
  userId: string
  challengeId: string
  specifier: string
  amount: number
  source: string
  error: string
  phase: string
}

type RewardsClaimFailure = {
  eventName: Name.REWARDS_CLAIM_FAILURE
  userId: string
  challengeId: string
  specifier: string
  amount: number
  source: string
  error: string
  phase: string
}

type RewardsClaimRejection = {
  eventName: Name.REWARDS_CLAIM_REJECTION
  userId: string
  challengeId: string
  specifier: string
  amount: number
  source: string
  error: string
}

type RewardsClaimUnknown = {
  eventName: Name.REWARDS_CLAIM_UNKNOWN
  userId: string
  challengeId: string
  specifier: string
  amount: number
  source: string
  error: string
}

export type TipSource =
  | 'profile'
  | 'feed'
  | 'dethroned'
  | 'buyAudio'
  | 'trackPage'
  | 'howToUnlockTrackPage'
  | 'howToUnlockModal'
  | 'inboxUnavailableModal'

type TipAudioRequest = {
  eventName: Name.TIP_AUDIO_REQUEST
  amount: StringAudio
  senderWallet: SolanaWalletAddress
  recipientWallet: SolanaWalletAddress
  senderHandle: string
  recipientHandle: string
  source: TipSource
  device: 'web' | 'native'
}

type TipAudioSuccess = {
  eventName: Name.TIP_AUDIO_SUCCESS
  amount: StringAudio
  senderWallet: SolanaWalletAddress
  recipientWallet: SolanaWalletAddress
  senderHandle: string
  recipientHandle: string
  source: TipSource
  device: 'web' | 'native'
}

type TipAudioFailure = {
  eventName: Name.TIP_AUDIO_FAILURE
  amount: StringAudio
  senderWallet: SolanaWalletAddress
  recipientWallet: SolanaWalletAddress
  senderHandle: string
  recipientHandle: string
  error: string
  source: TipSource
  device: 'web' | 'native'
}

type TipAudioTwitterShare = {
  eventName: Name.TIP_AUDIO_TWITTER_SHARE
  amount: StringAudio
  senderWallet: SolanaWalletAddress
  recipientWallet: SolanaWalletAddress
  senderHandle: string
  recipientHandle: string
  source: TipSource
  device: 'web' | 'native'
}

type TipFeedTileDismiss = {
  eventName: Name.TIP_FEED_TILE_DISMISS
  accountId: string
  receiverId: string
  device: 'web' | 'native'
}

type SocialProofOpen = {
  eventName: Name.SOCIAL_PROOF_OPEN
  kind: 'instagram' | 'twitter' | 'tiktok'
  handle: string
}

type SocialProofSuccess = {
  eventName: Name.SOCIAL_PROOF_SUCCESS
  kind: 'instagram' | 'twitter' | 'tiktok'
  handle: string
  screenName: string
}

type SocialProofError = {
  eventName: Name.SOCIAL_PROOF_ERROR
  kind: 'instagram' | 'twitter' | 'tiktok'
  handle: string
  error: string
}

type AudiusOauthStart = {
  eventName: Name.AUDIUS_OAUTH_START
  redirectUriParam: string | string[]
  originParam: string | string[] | undefined | null
  appId: string | string[] // App name or API Key
  responseMode: string | string[] | undefined | null
  scope: string | string[]
}

type AudiusOauthSubmit = {
  eventName: Name.AUDIUS_OAUTH_SUBMIT
  appId: string | string[]
  scope: string | string[]
  alreadySignedIn: boolean
}

type AudiusOauthComplete = {
  eventName: Name.AUDIUS_OAUTH_COMPLETE
  appId: string | string[]
  scope: string | string[]
  alreadyAuthorized?: boolean
}

type AudiusOauthError = {
  eventName: Name.AUDIUS_OAUTH_ERROR
  appId: string | string[]
  scope: string | string[]
  isUserError: boolean
  error: string
}

type DeveloperAppCreateSubmit = {
  eventName: Name.DEVELOPER_APP_CREATE_SUBMIT
  name?: string
  description?: string
}

type DeveloperAppCreateSuccess = {
  eventName: Name.DEVELOPER_APP_CREATE_SUCCESS
  name: string
  apiKey: string
}

type DeveloperAppCreateError = {
  eventName: Name.DEVELOPER_APP_CREATE_ERROR
  error?: string
}

type DeveloperAppDeleteSuccess = {
  eventName: Name.DEVELOPER_APP_DELETE_SUCCESS
  name?: string
  apiKey?: string
}

type DeveloperAppDeleteError = {
  eventName: Name.DEVELOPER_APP_DELETE_ERROR
  name?: string
  apiKey?: string
  error?: string
}

type BuyAudioOnRampOpened = {
  eventName: Name.BUY_AUDIO_ON_RAMP_OPENED
  provider: string
}

type BuyAudioOnRampCanceled = {
  eventName: Name.BUY_AUDIO_ON_RAMP_CANCELED
  provider: string
}

type BuyAudioOnRampSuccess = {
  eventName: Name.BUY_AUDIO_ON_RAMP_SUCCESS
  provider: string
}

type BuyAudioSuccess = {
  eventName: Name.BUY_AUDIO_SUCCESS
  provider: string
  requestedAudio: number
  actualAudio: number
  surplusAudio: number
}

type BuyAudioFailure = {
  eventName: Name.BUY_AUDIO_FAILURE
  provider: string
  requestedAudio: number
  stage: string
  error: string
}

type BuyAudioRecoveryOpened = {
  eventName: Name.BUY_AUDIO_RECOVERY_OPENED
  provider: string
  trigger: string
  balance: string
}

type BuyAudioRecoverySuccess = {
  eventName: Name.BUY_AUDIO_RECOVERY_SUCCESS
  provider: string
  audioRecovered: number
}

type BuyAudioRecoveryFailure = {
  eventName: Name.BUY_AUDIO_RECOVERY_FAILURE
  provider: string
  stage: string
  error: string
}

type BuyUSDCOnRampOpened = {
  eventName: Name.BUY_USDC_ON_RAMP_OPENED
  provider: string
}

type BuyUSDCOnRampCanceled = {
  eventName: Name.BUY_USDC_ON_RAMP_CANCELED
  provider: string
}

type BuyUSDCOnRampSuccess = {
  eventName: Name.BUY_USDC_ON_RAMP_SUCCESS
  provider: string
}

type BuyUSDCSuccess = {
  eventName: Name.BUY_USDC_SUCCESS
  provider: string
  requestedAmount: number
}

type BuyUSDCFailure = {
  eventName: Name.BUY_USDC_FAILURE
  provider: string
  requestedAmount: number
  error: string
}

type PurchaseContentStarted = {
  eventName: Name.PURCHASE_CONTENT_STARTED
  contentId: number
  contentType: string
}
type PurchaseContentSuccess = {
  eventName: Name.PURCHASE_CONTENT_SUCCESS
  contentId: number
  contentType: string
}
type PurchaseContentFailure = {
  eventName: Name.PURCHASE_CONTENT_FAILURE
  contentId: number
  contentType: string
  error: string
}

type RateCtaDisplayed = {
  eventName: Name.RATE_CTA_DISPLAYED
}

type RateCtaResponseNo = {
  eventName: Name.RATE_CTA_RESPONSE_NO
}

type RateCtaResponseYes = {
  eventName: Name.RATE_CTA_RESPONSE_YES
}

type ConnectWalletNewWalletStart = {
  eventName: Name.CONNECT_WALLET_NEW_WALLET_START
}

type ConnectWalletNewWalletConnecting = {
  eventName: Name.CONNECT_WALLET_NEW_WALLET_CONNECTING
  chain: Chain
  walletAddress: WalletAddress
}

type ConnectWalletNewWalletConnected = {
  eventName: Name.CONNECT_WALLET_NEW_WALLET_CONNECTED
  chain: Chain
  walletAddress: WalletAddress
}

type ConnectWalletAlreadyAssociated = {
  eventName: Name.CONNECT_WALLET_ALREADY_ASSOCIATED
  chain: Chain
  walletAddress: WalletAddress
}

type ConnectWalletAssociationError = {
  eventName: Name.CONNECT_WALLET_ASSOCIATION_ERROR
  chain: Chain
  walletAddress: WalletAddress
}

type ConnectWalletError = {
  eventName: Name.CONNECT_WALLET_ERROR
  error: string
}

type CreateChatSuccess = {
  eventName: Name.CREATE_CHAT_SUCCESS
}

type CreateChatFailure = {
  eventName: Name.CREATE_CHAT_FAILURE
}

type SendMessageSuccess = {
  eventName: Name.SEND_MESSAGE_SUCCESS
}

type SendMessageFailure = {
  eventName: Name.SEND_MESSAGE_FAILURE
}

type DeleteChatSuccess = {
  eventName: Name.DELETE_CHAT_SUCCESS
}

type DeleteChatFailure = {
  eventName: Name.DELETE_CHAT_FAILURE
}

type BlockUserSuccess = {
  eventName: Name.BLOCK_USER_SUCCESS
  blockedUserId: ID
}

type BlockUserFailure = {
  eventName: Name.BLOCK_USER_FAILURE
  blockedUserId: ID
}

type ChangeInboxSettingsSuccess = {
  eventName: Name.CHANGE_INBOX_SETTINGS_SUCCESS
  permission: ChatPermission
}

type ChangeInboxSettingsFailure = {
  eventName: Name.CHANGE_INBOX_SETTINGS_FAILURE
  permission: ChatPermission
}

type SendMessageReactionSuccess = {
  eventName: Name.SEND_MESSAGE_REACTION_SUCCESS
  reaction: string | null
}

type SendMessageReactionFailure = {
  eventName: Name.SEND_MESSAGE_REACTION_FAILURE
  reaction: string | null
}

type MessageUnfurlTrack = {
  eventName: Name.MESSAGE_UNFURL_TRACK
}

type MessageUnfurlPlaylist = {
  eventName: Name.MESSAGE_UNFURL_PLAYLIST
}

type TipUnlockedChat = {
  eventName: Name.TIP_UNLOCKED_CHAT
  recipientUserId: ID
}

type ChatReportUser = {
  eventName: Name.CHAT_REPORT_USER
  reportedUserId: ID
}

type ChatEntryPoint = {
  eventName: Name.CHAT_ENTRY_POINT
  source: 'banner' | 'navmenu' | 'share' | 'profile'
}

export type BaseAnalyticsEvent = { type: typeof ANALYTICS_TRACK_EVENT }

export type AllTrackingEvents =
  | CreateAccountOpen
  | CreateAccountCompleteEmail
  | CreateAccountCompletePassword
  | CreateAccountStartTwitter
  | CreateAccountCompleteTwitter
  | CreateAccountStartInstagram
  | CreateAccountCompleteInstagram
  | CreateAccountStartTikTok
  | CreateAccountCompleteTikTok
  | CreateAccountCompleteProfile
  | CreateAccountCompleteFollow
  | CreateAccountCompleteCreating
  | CreateAccountOpenFinish
  | SignInOpen
  | SignInFinish
  | SignInWithIncompleteAccount
  | SettingsChangeTheme
  | SettingsStartTwitterOauth
  | SettingsCompleteTwitterOauth
  | SettingsStartInstagramOauth
  | SettingsCompleteInstagramOauth
  | SettingsStartTikTokOauth
  | SettingsCompleteTikTokOauth
  | SettingsResetAccountRecovery
  | SettingsStartChangePassword
  | SettingsCompleteChangePassword
  | SettingsLogOut
  | TikTokStartOAuth
  | TikTokCompleteOAuth
  | TikTokOAuthError
  | TikTokStartShareSound
  | TikTokCompleteShareSound
  | TikTokShareSoundError
  | VisualizerOpen
  | VisualizerClose
  | AccountHealthMeterFull
  | AccountHealthUploadCoverPhoto
  | AccountHealthUploadProfilePhoto
  | AccountHealthDownloadDesktop
  | AccountHealthCTABanner
  | Share
  | ShareToTwitter
  | Repost
  | UndoRepost
  | Favorite
  | Unfavorite
  | ArtistPickSelectTrack
  | PlaylistAdd
  | PlaylistOpenCreate
  | PlaylistStartCreate
  | PlaylistCompleteCreate
  | PlaylistMakePublic
  | PlaylistOpenEditFromLibrary
  | Delete
  | EmbedOpen
  | EmbedCopy
  | TrackUploadOpen
  | TrackUploadStartUploading
  | TrackUploadTrackUploading
  | TrackUploadCompleteUpload
  | TrackUploadCollectibleGated
  | TrackUploadFollowGated
  | TrackUploadTipGated
  | TrackUploadSuccess
  | TrackUploadFailure
  | TrackUploadRejected
  | TrackUploadCopyLink
  | TrackUploadShareWithFans
  | TrackUploadShareSoundToTikTok
  | TrackUploadViewTrackPage
  | CollectibleGatedTrackUnlocked
  | FollowGatedTrackUnlocked
  | TipGatedTrackUnlocked
  | TrendingChangeView
  | TrendingPaginate
  | FeedChangeView
  | FeedPaginate
  | NotificationsOpen
  | NotificationsClickTile
  | NotificationsClickMilestone
  | NotificationsClickRemixCreate
  | NotificationsClickRemixCosign
  | NotificationsClickTipReaction
  | NotificationsClickTipReceived
  | NotificationsClickTipSent
  | NotificationsClickDethroned
  | NotificationsClickSupporterRankUp
  | NotificationsClickSupportingRankUp
  | NotificationsClickAddTrackToPlaylist
  | NotificationsClickTrendingPlaylist
  | NotificationsClickTrendingTrack
  | NotificationsClickTrendingUnderground
  | NotificationsClickUSDCPurchaseBuyer
  | NotificationsClickTastemaker
  | NotificationsToggleSettings
  | ProfilePageTabClick
  | ProfilePageSort
  | ProfilePageClickInstagram
  | ProfilePageClickTwitter
  | ProfilePageClickTikTok
  | ProfilePageClickWebsite
  | ProfilePageClickDonation
  | ProfilePageShownArtistRecommendations
  | TrackPageDownload
  | TrackPagePlayMore
  | PlaybackPlay
  | PlaybackPause
  | Follow
  | Unfollow
  | LinkClicking
  | TagClicking
  | SearchTerm
  | SearchTag
  | SearchMoreResults
  | SearchResultSelect
  | SearchTabClick
  | Listen
  | ListenGated
  | ErrorPage
  | NotFoundPage
  | PageView
  | OnFirstPage
  | NotOnFirstPage
  | BrowserNotificationSetting
  | TweetFirstUpload
  | DiscoveryProviderSelection
  | WebVitals
  | Performance
  | StemCompleteUpload
  | StemDelete
  | RemixNewRemix
  | RemixCosign
  | RemixCosignIndicator
  | RemixHide
  | SendAudioRequest
  | SendAudioSuccess
  | SendAudioFailure
  | ServiceMonitorRequest
  | ServiceMonitorHealthCheck
  | PlaylistLibraryReorder
  | PlaylistLibraryHasUpdate
  | PlaylistLibraryClicked
  | PlaylistLibraryMovePlaylistIntoFolder
  | PlaylistLibraryAddPlaylistToFolder
  | PlaylistLibraryMovePlaylistOutOfFolder
  | PlaylistLibraryExpandFolder
  | PlaylistLibraryCollapseFolder
  | TransferAudioToWAudioRequest
  | TransferAudioToWAudioSuccess
  | TransferAudioToWAudioFailure
  | DeactivateAccountPageView
  | DeactivateAccountRequest
  | DeactivateAccountSuccess
  | DeactivateAccountFailure
  | CreateUserBankRequest
  | CreateUserBankSuccess
  | CreateUserBankFailure
  | RewardsClaimStart
  | RewardsClaimSuccess
  | RewardsClaimRetry
  | RewardsClaimFailure
  | RewardsClaimRejection
  | RewardsClaimUnknown
  | TipAudioRequest
  | TipAudioSuccess
  | TipAudioFailure
  | TipAudioTwitterShare
  | TipFeedTileDismiss
  | SocialProofOpen
  | SocialProofSuccess
  | SocialProofError
  | FolderOpenCreate
  | FolderSubmitCreate
  | FolderCancelCreate
  | FolderOpenEdit
  | FolderSubmitEdit
  | FolderDelete
  | FolderCancelEdit
  | AudiusOauthStart
  | AudiusOauthComplete
  | AudiusOauthSubmit
  | AudiusOauthError
  | BuyAudioOnRampOpened
  | BuyAudioOnRampSuccess
  | BuyAudioOnRampCanceled
  | BuyAudioSuccess
  | BuyAudioFailure
  | BuyAudioRecoveryOpened
  | BuyAudioRecoverySuccess
  | BuyAudioRecoveryFailure
  | BuyUSDCOnRampOpened
  | BuyUSDCOnRampSuccess
  | BuyUSDCOnRampCanceled
  | BuyUSDCSuccess
  | BuyUSDCFailure
  | PurchaseContentStarted
  | PurchaseContentSuccess
  | PurchaseContentFailure
  | RateCtaDisplayed
  | RateCtaResponseNo
  | RateCtaResponseYes
  | ConnectWalletNewWalletStart
  | ConnectWalletNewWalletConnecting
  | ConnectWalletNewWalletConnected
  | ConnectWalletAlreadyAssociated
  | ConnectWalletAssociationError
  | ConnectWalletError
  | SendMessageSuccess
  | CreateChatSuccess
  | CreateChatFailure
  | SendMessageSuccess
  | SendMessageFailure
  | DeleteChatSuccess
  | DeleteChatFailure
  | BlockUserSuccess
  | BlockUserFailure
  | ChangeInboxSettingsSuccess
  | ChangeInboxSettingsFailure
  | SendMessageReactionSuccess
  | SendMessageReactionFailure
  | MessageUnfurlTrack
  | MessageUnfurlPlaylist
  | TipUnlockedChat
  | ChatReportUser
  | DeveloperAppCreateSubmit
  | DeveloperAppCreateSuccess
  | DeveloperAppCreateError
  | DeveloperAppDeleteSuccess
  | DeveloperAppDeleteError
  | ChatEntryPoint
