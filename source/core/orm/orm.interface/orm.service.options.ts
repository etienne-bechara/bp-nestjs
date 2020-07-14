export interface OrmServiceOptions {
  defaults?: {
    uniqueKey?: string[];
    populate?: boolean | string[]
  }
}
