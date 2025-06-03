export interface EntityMapper<Model, Entity> {
  fromDomain(model: Model): Entity;

  toDomain(entity: Entity): Model;
}
