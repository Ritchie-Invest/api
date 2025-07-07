# Architecture and Contribution Guide

This project follows the principles of Clean Architecture, Hexagonal Architecture, and Domain-Driven Design (DDD).

## Project Structure

- **src/core/domain/**: business core (entities, value objects, services, repository interfaces, errors, types)
- **src/core/usecases/**: use cases (application business logic)
- **src/adapters/**: infrastructure (API, concrete repositories, mappers, decorators, guards)
- **src/config/**: configuration and global filters
- **test/**: end-to-end tests

## Main Rules

- Business logic never depends on infrastructure.
- Use cases only use abstractions (repositories, services).
- API controllers contain no business logic.
- Business errors are centralized in `core/domain/error`.
- Unit tests are in `core/usecases/__test__`.

## Workflow for a New Feature

1. Define/modify the entity or business service in `core/domain/model` or `core/domain/service`.
2. Define the repository interface in `core/domain/repository` if needed.
3. Implement the use case in `core/usecases`.
4. Add the concrete repository implementation in `adapters/prisma` or `adapters/in-memory`.
5. Expose the feature via a controller in `adapters/api/controller`.

## Best Practices

- Never import elements from `adapters` into `core`.
- Use mappers for any conversion between business entities and DTO/API.
- Respect the strict separation of responsibilities.

---

For any questions, refer to this guide or contact the technical team.

# Copilot Instructions for ritchie-invest-api

## General Principles

- **Strict separation of layers**: business logic (core/domain) never depends on infrastructure (adapters).
- **Directed dependencies**: dependencies always go from the outside in (adapters → core), never the reverse.
- **Respect for DDD**: entities, value objects, aggregates, and business services are in `src/core/domain/model` and
  `src/core/domain/service`.

## Folder Structure

- `src/core/domain/model`: entities, value objects, aggregates.
- `src/core/domain/service`: pure business services.
- `src/core/domain/repository`: repository interfaces.
- `src/core/domain/error`: business errors.
- `src/core/domain/type`: shared types.
- `src/core/usecases`: use cases (application business logic).
- `src/adapters/prisma`: concrete implementations of repositories (e.g., Prisma).
- `src/adapters/in-memory`: in-memory implementations for testing.
- `src/adapters/api/controller`: API controllers (no business logic).
- `src/adapters/api/mapper`: mappers for DTO/API.
- `src/adapters/api/decorator`, `guards`: API decorators and guards.
- `src/config`: configuration and global filters.
- `test/`: end-to-end tests.

## Development Rules

- **No business logic in adapters**: anything related to business logic must be in the core.
- **Use cases only use abstractions** (repositories, services), never concrete implementations.
- **API controllers** only call use cases and convert data using mappers.
- **For any new business feature**:
    1. Create/modify the entity or business service in `core/domain/model` or `core/domain/service`.
    2. Define the repository interface if needed in `core/domain/repository`.
    3. Implement the use case in `core/usecases`.
    4. Add the concrete repository implementation in `adapters/prisma` or `adapters/in-memory`.
    5. Expose it via a controller in `adapters/api/controller`.

## Best Practices

- **Never import elements from `adapters` into `core`**.
- **Business errors** are centralized in `core/domain/error`.
- **Unit tests** are in `core/usecases/__test__`.
- **Use mappers** for any conversion between business entities and DTO/API.

## Examples

- To add an entity:
    - Create the file in `core/domain/model`.
- For a new use case:
    - Create the file in `core/usecases` and inject dependencies via interfaces.
- For a new API route:
    - Create a controller in `adapters/api/controller` and use the corresponding use case.

---

Adapt this file according to the evolution of the codebase and share it with the team to ensure architectural
consistency.
