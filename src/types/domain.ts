import type { IconType } from 'react-icons';

/** Visual style of a status chip; maps 1:1 to a `.chip-*` CSS class. */
export type ChipStyle = 'chip-gray' | 'chip-blue' | 'chip-green' | 'chip-yellow' | 'chip-red';

/** A knowledge-base article shown in topic pages and search. */
export interface Article {
  id: string;
  type: string;
  /** Topic slug (`account`, `payments`, …) or a game title. */
  product: string;
  category: string;
  title: string;
  preview: string;
  url?: string;
}

/** An article attached to a single game. */
export interface GameArticle {
  eyebrow: string;
  /** Some legacy entries have no category; they never appear in category-filtered lists. */
  category?: string;
  title: string;
  preview: string;
  url?: string;
}

export interface Game {
  id: string;
  genre: string;
  title: string;
  year: string;
  tag: 'active' | 'legacy';
  thumb: string;
  /** Wordmark shown on the game page. */
  logo: string;
  /** Hero image. */
  img: string;
  /** Tile key art. */
  tile: string;
  /** Monochrome logo overlaid on the tile. */
  tilelogo: string;
  articles: GameArticle[];
}

/** Card entry for the home "Help Topics" grid and the account tools grid. */
export interface TopicTile {
  id: string;
  icon: IconType;
  product: string;
  subtitle: string;
}

export type CaseStatus = 'open' | 'closed';

export interface SupportCase {
  id: string;
  img: string;
  game: string;
  platform: string;
  case: string;
  status: CaseStatus;
  /** `active` cases can still be resumed; `inactive` cases are archived. */
  type: 'active' | 'inactive';
  outcome: string;
  date: string;
  dateUpdate: string;
  time: string;
  title: string;
  chipStyle: ChipStyle;
  description: string;
  conversation: string;
}

export interface Infraction {
  id: string;
  img: string;
  game: string;
  type: 'suspension' | 'ban';
  status: 'open' | 'closed';
  outcome: string;
  date: string;
  enddate: string;
  title: string;
  chipStyle: ChipStyle;
  typeStyle: ChipStyle;
  description: string;
}

export interface ConversationMessage {
  id: string;
  user: string;
  message: string;
  summary?: string;
  /** Unix epoch in milliseconds, stored as a string. */
  time: string;
}
