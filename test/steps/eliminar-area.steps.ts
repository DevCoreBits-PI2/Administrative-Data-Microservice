// test/bdd/steps/eliminar-area.steps.ts
import { Test, TestingModule } from '@nestjs/testing';
import { defineFeature, loadFeature } from 'jest-cucumber';
import * as path from 'path';
import { RpcException } from '@nestjs/microservices';

import { mockPrismaService, mockArea, resetMocks } from '../mocks/prisma.mock';

jest.mock('../../src/config', () => ({
  envs: {
    databaseUrl: 'postgresql://mock:mock@localhost:5432/mock',
    natsServers: ['nats://localhost:4222'],
  },
  NATS_SERVICE: 'NATS_SERVICE',
}));

jest.mock('../../src/lib/prismaService/prisma', () => ({
  PrismaService: jest.fn().mockImplementation(() => mockPrismaService),
}));

import { AreasService } from '../../src/areas/areas.service';
import { PrismaService } from '../../src/lib/prismaService/prisma';

const feature = loadFeature(
  path.join(__dirname, '../features/eliminar-area.feature'),
);

type DeleteResult = {
  message?: string;
  [key: string]: unknown;
};

defineFeature(feature, (test) => {
  let service: AreasService;
  let result: unknown;
  let thrownError: RpcException | Error | undefined;

  beforeEach(async () => {
    resetMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AreasService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<AreasService>(AreasService);
    result = undefined;
    thrownError = undefined;
  });

  test('Rechazo por eliminacion de area inexistente', ({
    given,
    when,
    then,
  }) => {
    given('que no existe ninguna area con id 999', () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      (mockPrismaService.areas.findUnique as any).mockResolvedValue(null);
    });

    when('el administrador intenta eliminar el area con id 999', async () => {
      try {
        result = await service.remove(999);
      } catch (error) {
        thrownError = error as RpcException;
      }
    });

    then(
      'el sistema retorna error indicando que el area no fue encontrada',
      () => {
        expect(thrownError).toBeInstanceOf(RpcException);
        const payload = (thrownError as RpcException).getError() as {
          status: number;
          message: string;
        };
        expect(payload.status).toBe(404);
        expect(payload.message).toMatch(/999|no encontrada/i);
      },
    );
  });

  test('Bloqueo de eliminacion por cargos asociados al area', ({
    given,
    when,
    then,
    and,
  }) => {
    given(
      /^que existe un area con id (\d+) que tiene (\d+) cargos asociados$/,
      (id: string, cantidadCargos: string) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        (mockPrismaService.areas.findUnique as any).mockResolvedValue({
          ...mockArea,
          id_area: Number(id),
          _count: { positions: Number(cantidadCargos) },
        });
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        (mockPrismaService.positions.count as any).mockResolvedValue(
          Number(cantidadCargos),
        );
      },
    );

    when(
      /^el administrador intenta eliminar el area con id (\d+)$/,
      async (id: string) => {
        try {
          result = await service.remove(Number(id));
        } catch (error) {
          thrownError = error as RpcException;
        }
      },
    );

    then(
      'el sistema bloquea la operacion indicando que el area tiene cargos vinculados',
      () => {
        expect(thrownError).toBeInstanceOf(RpcException);
        const payload = (thrownError as RpcException).getError() as {
          status: number;
          message: string;
        };
        expect(payload.status).toBe(400);
        expect(payload.message).toMatch(/associated positions/i);
      },
    );

    and('no se elimina ni modifica el area', () => {
      expect(mockPrismaService.areas.update).not.toHaveBeenCalled();
      expect(mockPrismaService.areas.delete).not.toHaveBeenCalled();
    });
  });

  test('Eliminacion logica exitosa de area sin cargos', ({
    given,
    when,
    then,
    and,
  }) => {
    given(
      /^que existe un area con id (\d+) sin cargos asociados$/,
      (id: string) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        (mockPrismaService.areas.findUnique as any).mockResolvedValue({
          ...mockArea,
          id_area: Number(id),
          _count: { positions: 0 },
        });
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        (mockPrismaService.positions.count as any).mockResolvedValue(0);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        (mockPrismaService.areas.update as any).mockResolvedValue({
          ...mockArea,
          id_area: Number(id),
          status: 'inactive',
        });
      },
    );

    when(
      /^el administrador elimina el area con id (\d+)$/,
      async (id: string) => {
        result = await service.remove(Number(id));
      },
    );

    then('el sistema marca el area como inactiva en la base de datos', () => {
      // Verifica eliminacion logica: update con status inactive, NO delete
      expect(mockPrismaService.areas.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id_area: 1 },
          data: { status: 'inactive' },
        }),
      );
      expect(mockPrismaService.areas.delete).not.toHaveBeenCalled();
    });

    and('retorna mensaje de confirmacion de eliminacion exitosa', () => {
      expect((result as DeleteResult).message).toMatch(/deleted successfully/i);
    });
  });

  test('Area inactiva no aparece en consultas de areas activas', ({
    given,
    when,
    then,
  }) => {
    given(
      /^que el area con id (\d+) fue eliminada logicamente con status "(.*)"$/,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      (_id: string, _status: string) => {
        // findMany con filtro active no devuelve el area inactiva
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        (mockPrismaService.areas.findMany as any).mockResolvedValue([]);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        (mockPrismaService.areas.count as any).mockResolvedValue(0);
      },
    );

    when(
      /^se consultan las areas con filtro de status "(.*)"$/,
      async (status: string) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        result = await service.findAll({
          page: 1,
          limit: 10,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          status: status as any,
        } as any);
      },
    );

    then(
      /^el area con id (\d+) no aparece en los resultados$/,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      (_id: string) => {
        const data = (result as { data: unknown[] }).data;
        expect(data).toHaveLength(0);
        // Verifica que Prisma filtro por status active
        expect(mockPrismaService.areas.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            where: expect.objectContaining({ status: 'active' }),
          }),
        );
      },
    );
  });

  test('Error tecnico durante la eliminacion del area', ({
    given,
    and,
    when,
    then,
  }) => {
    given(
      /^que existe un area con id (\d+) sin cargos asociados$/,
      (id: string) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        (mockPrismaService.areas.findUnique as any).mockResolvedValue({
          ...mockArea,
          id_area: Number(id),
        });
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        (mockPrismaService.positions.count as any).mockResolvedValue(0);
      },
    );

    and('ocurre un error de conexion al intentar eliminar', () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      (mockPrismaService.areas.update as any).mockRejectedValue(
        new Error('Database connection lost during deletion'),
      );
    });

    when(
      /^el administrador intenta eliminar el area con id (\d+)$/,
      async (id: string) => {
        try {
          result = await service.remove(Number(id));
        } catch (error) {
          thrownError = error as RpcException;
        }
      },
    );

    then('el sistema lanza una excepcion descriptiva del error', () => {
      expect(thrownError).toBeInstanceOf(RpcException);
      const payload = (thrownError as RpcException).getError() as {
        status: number;
        message: string;
      };
      expect(payload.status).toBe(400);
      expect(payload.message).toMatch(/Database connection lost/i);
    });

    and('el area no es modificada', () => {
      expect(mockPrismaService.areas.update).toHaveBeenCalledTimes(1);
    });
  });
});
