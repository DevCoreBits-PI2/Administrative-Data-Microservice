// test/bdd/steps/editar-area.steps.ts
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
import { UpdateAreaDto } from '../../src/areas/dto/update-area.dto';

const feature = loadFeature(
  path.join(__dirname, '../features/editar-area.feature'),
);

type AreaResult = {
  id_area?: number;
  name?: string;
  description?: string;
  status?: string;
  [key: string]: unknown;
};

function makePrismaP2002(): Error & { code?: string; meta?: object } {
  const error = new Error(
    'Unique constraint failed on the fields: (`name`)',
  ) as Error & { code?: string; meta?: object };
  error.code = 'P2002';
  error.meta = {};
  return error;
}

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

  test('Rechazo por edicion de area que no existe', ({ given, when, then }) => {
    given('que no existe ninguna area con id 999', () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      (mockPrismaService.areas.findUnique as any).mockResolvedValue(null);
    });

    when('el administrador intenta editar el area con id 999', async () => {
      try {
        result = await service.update(999, {
          id: 999,
          name: 'Nuevo nombre',
        } as UpdateAreaDto);
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

  test('Edicion exitosa con espacios removidos del nombre', ({
    given,
    when,
    then,
  }) => {
    given(/^que existe un area con id (\d+) y nombre "(.*)"$/, (id: string) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      (mockPrismaService.areas.findUnique as any).mockResolvedValue({
        ...mockArea,
        id_area: Number(id),
      });
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      (mockPrismaService.areas.update as any).mockResolvedValue({
        ...mockArea,
        id_area: Number(id),
        name: 'Nomina',
      });
    });

    when(
      /^el administrador actualiza el nombre a "(.*)" con espacios$/,
      async (nombreConEspacios: string) => {
        result = await service.update(1, {
          id: 1,
          name: nombreConEspacios,
        } as UpdateAreaDto);
      },
    );

    then(
      /^el sistema guarda el area con el nombre recortado "(.*)"$/,
      (nombreEsperado: string) => {
        expect(mockPrismaService.areas.update).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { id_area: 1 },
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            data: expect.objectContaining({ name: nombreEsperado }),
          }),
        );
        expect((result as AreaResult).name).toBe(nombreEsperado);
      },
    );
  });

  test('Rechazo por nombre vacio en edicion', ({ given, when, then, and }) => {
    given(/^que existe un area con id (\d+) y nombre "(.*)"$/, (id: string) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      (mockPrismaService.areas.findUnique as any).mockResolvedValue({
        ...mockArea,
        id_area: Number(id),
      });
    });

    when(
      /^el administrador intenta actualizar el nombre con menos de 3 caracteres "(.*)"$/,
      async (nombreCorto: string) => {
        try {
          result = await service.update(1, {
            id: 1,
            name: nombreCorto,
          } as UpdateAreaDto);
        } catch (error) {
          thrownError = error as RpcException;
        }
      },
    );

    then('el sistema rechaza la edicion con error de longitud invalida', () => {
      expect(thrownError).toBeInstanceOf(RpcException);
      const payload = (thrownError as RpcException).getError() as {
        status: number;
        message: string;
      };
      expect(payload.status).toBe(400);
      expect(payload.message).toMatch(/between 3 and 100/i);
    });

    and('no se modifica ningun dato en la base de datos', () => {
      expect(mockPrismaService.areas.update).not.toHaveBeenCalled();
    });
  });

  test('Rechazo por nombre duplicado en edicion', ({
    given,
    and,
    when,
    then,
  }) => {
    given(/^que existe un area con id (\d+) y nombre "(.*)"$/, (id: string) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      (mockPrismaService.areas.findUnique as any).mockResolvedValue({
        ...mockArea,
        id_area: Number(id),
      });
    });

    and(/^existe otra area diferente con el nombre "(.*)"$/, () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      (mockPrismaService.areas.update as any).mockRejectedValue(
        makePrismaP2002(),
      );
    });

    when(
      /^el administrador intenta cambiar el nombre del area con id (\d+) a "(.*)"$/,
      async (id: string, nombreDuplicado: string) => {
        try {
          result = await service.update(Number(id), {
            id: Number(id),
            name: nombreDuplicado,
          } as UpdateAreaDto);
        } catch (error) {
          thrownError = error as RpcException;
        }
      },
    );

    then(
      'el sistema bloquea la operacion con error de nombre duplicado',
      () => {
        expect(thrownError).toBeInstanceOf(RpcException);
        const payload = (thrownError as RpcException).getError() as {
          status: number;
          message: string;
        };
        expect(payload.status).toBe(409);
        expect(payload.message).toMatch(/already exists/i);
      },
    );

    and('no se modifica ningun dato en la base de datos', () => {
      expect(mockPrismaService.areas.update).toHaveBeenCalledTimes(1);
    });
  });

  test('Edicion exitosa con datos validos', ({ given, when, then, and }) => {
    given(/^que existe un area con id (\d+) y nombre "(.*)"$/, (id: string) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      (mockPrismaService.areas.findUnique as any).mockResolvedValue({
        ...mockArea,
        id_area: Number(id),
      });
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      (mockPrismaService.areas.update as any).mockResolvedValue({
        ...mockArea,
        id_area: Number(id),
        name: 'Gestion Humana',
        description: 'Nueva descripcion',
      });
    });

    when(
      /^el administrador actualiza el nombre a "(.*)" y descripcion a "(.*)"$/,
      async (nuevoNombre: string, nuevaDesc: string) => {
        result = await service.update(1, {
          id: 1,
          name: nuevoNombre,
          description: nuevaDesc,
        } as UpdateAreaDto);
      },
    );

    then(
      'el sistema actualiza el area correctamente en la base de datos',
      () => {
        expect(mockPrismaService.areas.update).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { id_area: 1 },
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            data: expect.objectContaining({
              name: 'Gestion Humana',
              description: 'Nueva descripcion',
            }),
          }),
        );
      },
    );

    and('retorna los datos actualizados del area', () => {
      expect((result as AreaResult).name).toBe('Gestion Humana');
      expect((result as AreaResult).description).toBe('Nueva descripcion');
    });
  });

  test('Error tecnico durante la edicion del area', ({
    given,
    and,
    when,
    then,
  }) => {
    given(/^que existe un area con id (\d+) y nombre "(.*)"$/, (id: string) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      (mockPrismaService.areas.findUnique as any).mockResolvedValue({
        ...mockArea,
        id_area: Number(id),
      });
    });

    and('ocurre un error de conexion al intentar actualizar', () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      (mockPrismaService.areas.update as any).mockRejectedValue(
        new Error('Connection lost during update'),
      );
    });

    when(
      /^el administrador intenta guardar los cambios del area con id (\d+)$/,
      async (id: string) => {
        try {
          result = await service.update(Number(id), {
            id: Number(id),
            name: 'Cualquier nombre',
          } as UpdateAreaDto);
        } catch (error) {
          thrownError = error as RpcException;
        }
      },
    );

    then('el sistema lanza una excepcion descriptiva', () => {
      expect(thrownError).toBeInstanceOf(RpcException);
      const payload = (thrownError as RpcException).getError() as {
        status: number;
        message: string;
      };
      expect(payload.status).toBe(400);
      expect(payload.message).toMatch(/Connection lost/i);
    });

    and('no quedan cambios parciales aplicados', () => {
      expect(mockPrismaService.areas.update).toHaveBeenCalledTimes(1);
    });
  });
});
