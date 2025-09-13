import { BadgeCatalogItem } from '../../../core/usecases/get-badge-catalog.use-case';
import { BadgeCatalogItemResponse } from '../response/badge-catalog.response';

export class GetBadgeCatalogMapper {
  static fromDomain(items: BadgeCatalogItem[]): BadgeCatalogItemResponse[] {
    return items.map(
      (i) =>
        new BadgeCatalogItemResponse(
          i.type,
          i.name,
          i.iconPath,
          i.description,
          i.awardedAt,
        ),
    );
  }
}
