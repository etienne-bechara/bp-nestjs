export interface AbstractPartialResponse<Entity> {
  order: string;
  limit: number;
  offset: number;
  count: number;
  records: Entity[];
}
