export interface AbstractPartialEntity<Entity> {
  limit: number;
  offset: number;
  total: number;
  results: Entity[];
}
