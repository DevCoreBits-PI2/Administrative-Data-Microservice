// test/bdd/mocks/prisma.mock.ts
// Tipos y mocks exactos basados en el schema real del proyecto:
// areas { id_area, name, description, id_administrator, created_at, status, positions[] }
// positions { id_position, id_area, ... }

import type { Mock } from 'jest-mock';
import { jest } from '@jest/globals';

type MockedMethods<T extends string> = Record<T, Mock>;

type AreasMock = MockedMethods<
  'create' | 'findUnique' | 'findMany' | 'update' | 'delete' | 'count'
>;

type PositionsMock = MockedMethods<
  'create' | 'findUnique' | 'findMany' | 'update' | 'delete' | 'count'
>;

export const mockPrismaService: {
  areas: AreasMock;
  positions: PositionsMock;
} = {
  areas: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  positions: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
};

export const mockArea = {
  id_area: 1,
  name: 'Recursos Humanos',
  description: 'Área encargada de la gestión del talento humano',
  id_administrator: 10,
  status: 'active' as const,
  created_at: new Date('2024-01-10'),
  _count: { positions: 0 },
};

export function resetMocks(): void {
  Object.values(mockPrismaService.areas).forEach((fn: jest.Mock) =>
    fn.mockReset(),
  );
  Object.values(mockPrismaService.positions).forEach((fn: jest.Mock) =>
    fn.mockReset(),
  );
}
