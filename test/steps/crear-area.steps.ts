// test/bdd/steps/crear-area.steps.ts
import { Test, TestingModule } from '@nestjs/testing';
import { defineFeature, loadFeature } from 'jest-cucumber';
import * as path from 'path';
import { RpcException } from '@nestjs/microservices';
import { jest } from '@jest/globals';

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
import { CreateAreaDto } from '../../src/areas/dto/create-area.dto';

const feature = loadFeature(
  path.join(__dirname, '../features/crear-area.feature'),
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
  let createDto: Partial<CreateAreaDto>;
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

  test('Creacion exitosa de area con datos validos', ({
    given,
    when,
    then,
    and,
  }) => {
    given(
      /^que el administrador tiene nombre "(.*)" y descripcion "(.*)" validos$/,
      (nombre: string, descripcion: string) => {
        createDto = {
          name: nombre,
          description: descripcion,
          id_administrator: 10,
        };

        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        (mockPrismaService.areas.create as any).mockResolvedValue({
          ...mockArea,
          name: nombre,
          description: descripcion,
        });
      },
    );

    when('confirma el registro del area', async () => {
      result = await service.create(createDto as CreateAreaDto);
    });

    then('el sistema almacena el area en la base de datos', () => {
      expect(mockPrismaService.areas.create).toHaveBeenCalledTimes(1);
      expect(mockPrismaService.areas.create).toHaveBeenCalledWith(
        expect.objectContaining({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          data: expect.objectContaining({
            name: 'Tecnologia',
            description: 'Area de sistemas',
            id_administrator: 10,
          }),
        }),
      );
    });

    and('retorna el registro creado con un identificador unico', () => {
      expect(result).toBeDefined();
      expect((result as AreaResult).id_area).toBeDefined();
      expect((result as AreaResult).name).toBe('Tecnologia');
    });
  });

  test('Rechazo por nombre de area duplicado', ({ given, when, then, and }) => {
    given(/^que ya existe un area registrada con el nombre "(.*)"$/, () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      (mockPrismaService.areas.create as any).mockRejectedValue(
        makePrismaP2002(),
      );
    });

    when(
      /^el administrador intenta crear otra area con el nombre "(.*)"$/,
      async (nombre: string) => {
        createDto = {
          name: nombre,
          description: 'Otra desc',
          id_administrator: 10,
        };
        try {
          result = await service.create(createDto as CreateAreaDto);
        } catch (error) {
          thrownError = error as RpcException;
        }
      },
    );

    then('el sistema rechaza la creacion con error de conflicto', () => {
      expect(thrownError).toBeDefined();
      expect(thrownError).toBeInstanceOf(RpcException);
      const payload = (thrownError as RpcException).getError() as {
        status: number;
        message: string;
      };
      expect(payload.status).toBe(409);
      expect(payload.message).toMatch(/already exists/i);
    });

    and('no se crea ningun registro en la base de datos', () => {
      expect(mockPrismaService.areas.create).toHaveBeenCalledTimes(1);
    });
  });

  test('Rechazo por nombre demasiado corto', ({ given, when, then }) => {
    given(
      /^que el administrador ingresa el nombre "(.*)" con menos de 3 caracteres$/,
      (nombre: string) => {
        createDto = {
          name: nombre,
          description: 'Alguna desc',
          id_administrator: 10,
        };
      },
    );

    when('intenta confirmar el registro del area', async () => {
      try {
        result = await service.create(createDto as CreateAreaDto);
      } catch (error) {
        thrownError = error as RpcException;
      }
    });

    then(
      'el sistema rechaza el registro con error de validacion de longitud',
      () => {
        expect(thrownError).toBeInstanceOf(RpcException);
        const payload = (thrownError as RpcException).getError() as {
          status: number;
          message: string;
        };
        expect(payload.status).toBe(400);
        expect(payload.message).toMatch(/between 3 and 100/i);
        expect(mockPrismaService.areas.create).not.toHaveBeenCalled();
      },
    );
  });

  test('Rechazo por nombre demasiado largo', ({ given, when, then }) => {
    given(
      'que el administrador ingresa un nombre con mas de 100 caracteres',
      () => {
        createDto = {
          name: 'A'.repeat(101),
          description: 'Alguna desc',
          id_administrator: 10,
        };
      },
    );

    when('intenta confirmar el registro del area', async () => {
      try {
        result = await service.create(createDto as CreateAreaDto);
      } catch (error) {
        thrownError = error as RpcException;
      }
    });

    then(
      'el sistema rechaza el registro con error de validacion de longitud',
      () => {
        expect(thrownError).toBeInstanceOf(RpcException);
        const payload = (thrownError as RpcException).getError() as {
          status: number;
          message: string;
        };
        expect(payload.status).toBe(400);
        expect(payload.message).toMatch(/between 3 and 100/i);
        expect(mockPrismaService.areas.create).not.toHaveBeenCalled();
      },
    );
  });

  test('Creacion exitosa con espacios removidos del nombre', ({
    given,
    when,
    then,
  }) => {
    given(
      /^que el administrador ingresa el nombre "(.*)" con espacios al inicio y final$/,
      (nombre: string) => {
        createDto = {
          name: nombre,
          description: 'Desc contable',
          id_administrator: 10,
        };

        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        (mockPrismaService.areas.create as any).mockResolvedValue({
          ...mockArea,
          name: 'Contabilidad',
        });
      },
    );

    when('confirma el registro del area', async () => {
      result = await service.create(createDto as CreateAreaDto);
    });

    then(
      /^el sistema elimina los espacios y almacena el area con nombre "(.*)"$/,
      (nombreEsperado: string) => {
        expect(mockPrismaService.areas.create).toHaveBeenCalledWith(
          expect.objectContaining({
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            data: expect.objectContaining({ name: nombreEsperado }),
          }),
        );
        expect((result as AreaResult).name).toBe(nombreEsperado);
      },
    );
  });

  test('Rechazo por nombre vacio', ({ given, when, then }) => {
    given('que el administrador deja el campo nombre vacio', () => {
      createDto = {
        name: '',
        description: 'Alguna desc',
        id_administrator: 10,
      };
    });

    when('intenta confirmar el registro del area', async () => {
      try {
        result = await service.create(createDto as CreateAreaDto);
      } catch (error) {
        thrownError = error as RpcException;
      }
    });

    then(
      'el sistema rechaza el registro con error de campo obligatorio',
      () => {
        expect(thrownError).toBeInstanceOf(RpcException);
        const payload = (thrownError as RpcException).getError() as {
          status: number;
          message: string;
        };
        expect(payload.status).toBe(400);
        expect(payload.message).toMatch(/between 3 and 100/i);
        expect(mockPrismaService.areas.create).not.toHaveBeenCalled();
      },
    );
  });

  test('Error tecnico durante el registro del area', ({
    given,
    and,
    when,
    then,
  }) => {
    given(
      /^que el administrador tiene nombre "(.*)" y descripcion "(.*)" validos$/,
      (nombre: string, descripcion: string) => {
        createDto = {
          name: nombre,
          description: descripcion,
          id_administrator: 10,
        };
      },
    );

    and('ocurre un error de conexion en la base de datos', () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      (mockPrismaService.areas.create as any).mockRejectedValue(
        new Error('Connection timeout: no se pudo conectar a la base de datos'),
      );
    });

    when('intenta confirmar el registro del area', async () => {
      try {
        result = await service.create(createDto as CreateAreaDto);
      } catch (error) {
        thrownError = error as RpcException;
      }
    });

    then(
      'el sistema lanza una excepcion con un mensaje descriptivo del error',
      () => {
        expect(thrownError).toBeDefined();
        expect(thrownError).toBeInstanceOf(RpcException);
      },
    );

    and('no se almacena informacion incompleta', () => {
      expect(mockPrismaService.areas.create).toHaveBeenCalledTimes(1);
    });
  });
});
