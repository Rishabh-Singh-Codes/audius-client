import { Nullable } from '../utils/typeUtils'

import { Chain } from './Chain'
import type { License } from './CreativeCommons'
import { Favorite } from './Favorite'
import { CID, ID, UID } from './Identifiers'
import { CoverArtSizes } from './ImageSizes'
import { Repost } from './Repost'
import { StemCategory } from './Stems'
import { Timestamped } from './Timestamped'
import { User, UserMetadata } from './User'

type EpochTimeStamp = number

export interface TrackSegment {
  duration: string
  multihash: CID
}

export interface Followee extends User {
  is_delete: boolean
  repost_item_id: string
  repost_type: string
}

export interface Download {
  // TODO: figure out why
  // is_downloadable and requires_follow
  // are randomly null on some tracks
  // returned from the API
  is_downloadable: Nullable<boolean>
  requires_follow: Nullable<boolean>
  cid: Nullable<string>
}

export type FieldVisibility = {
  genre: boolean
  mood: boolean
  tags: boolean
  share: boolean
  play_count: boolean
  remixes: boolean
}

export type Remix = {
  parent_track_id: ID
  user: User | any
  has_remix_author_reposted: boolean
  has_remix_author_saved: boolean
}

export type RemixOf = {
  tracks: Remix[]
}

type TokenStandard = 'ERC721' | 'ERC1155'

type PremiumConditionsEthNFTCollection = {
  chain: Chain.Eth
  standard: TokenStandard
  address: string
}

type PremiumConditionsSolNFTCollection = {
  chain: Chain.Sol
  name: string
}

export type PremiumConditions = {
  nft_collection?:
    | PremiumConditionsEthNFTCollection
    | PremiumConditionsSolNFTCollection
  follow_user_id?: number
}

export type PremiumContentSignature = {
  data: string
  signature: string
}

export type TrackMetadata = {
  blocknumber: number
  activity_timestamp?: string
  is_delete: boolean
  track_id: number
  created_at: string
  isrc: Nullable<string>
  iswc: Nullable<string>
  credits_splits: Nullable<string>
  description: Nullable<string>
  followee_reposts: Repost[]
  followee_saves: Favorite[]
  genre: string
  has_current_user_reposted: boolean
  has_current_user_saved: boolean
  download: Nullable<Download>
  license: Nullable<License>
  mood: Nullable<string>
  play_count: number
  owner_id: ID
  release_date: Nullable<string>
  repost_count: number
  save_count: number
  tags: Nullable<string>
  title: string
  track_segments: TrackSegment[]
  cover_art: Nullable<CID>
  cover_art_sizes: Nullable<CID>
  is_unlisted: boolean
  is_available: boolean
  is_premium: boolean
  premium_conditions: Nullable<PremiumConditions>
  premium_content_signature: Nullable<PremiumContentSignature>
  field_visibility?: FieldVisibility
  listenCount?: number
  permalink: string

  // Optional Fields
  is_invalid?: boolean
  stem_of?: {
    parent_track_id: ID
    category: StemCategory
  }
  remix_of: Nullable<RemixOf>

  // Added fields
  dateListened?: string
  duration: number

  offline?: OfflineTrackMetadata
} & Timestamped

// This is available on mobile for offline tracks
export type OfflineTrackMetadata = {
  downloaded_from_collection: string[]
  download_completed_time: EpochTimeStamp
  last_verified_time: EpochTimeStamp
}

export type Stem = {
  track_id: ID
  category: StemCategory
}

export type ComputedTrackProperties = {
  // All below, added clientside
  _cover_art_sizes: CoverArtSizes
  _first_segment?: string
  _followees?: Followee[]
  _marked_deleted?: boolean
  _is_publishing?: boolean
  _stems?: Stem[]

  // Present iff remixes have been fetched for a track
  _remixes?: Array<{ track_id: ID }>
  _remixes_count?: number
  // Present iff remix parents have been fetched for a track
  _remix_parents?: Array<{ track_id: ID }>
  // Present iff the track has been cosigned
  _co_sign?: Nullable<Remix>

  _blocked?: boolean
}

export type Track = TrackMetadata & ComputedTrackProperties

export type UserTrackMetadata = TrackMetadata & { user: UserMetadata }

export type UserTrack = Track & {
  user: User
}

export type LineupTrack = UserTrack & {
  uid: UID
}

// Track with known non-optional stem
export type StemTrackMetadata = TrackMetadata & Required<Pick<Track, 'stem_of'>>
export type StemTrack = Track & Required<Pick<Track, 'stem_of'>>
export type StemUserTrack = UserTrack & Required<Pick<Track, 'stem_of'>>

// Track with known non-optional remix parent
export type RemixTrack = Track & Required<Pick<Track, 'remix_of'>>
export type RemixUserTrack = UserTrack & Required<Pick<Track, 'remix_of'>>
