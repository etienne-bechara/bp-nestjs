export interface AbstractPartialResponse<Entity> {
  limit: number;
  offset: number;
  total: number;
  results: Entity[];
}
