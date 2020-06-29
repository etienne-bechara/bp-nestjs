export interface AbstractPartialEntity<Entity> {
  limit: number;
  offset: number;
  count: number;
  results: Entity[];
}
