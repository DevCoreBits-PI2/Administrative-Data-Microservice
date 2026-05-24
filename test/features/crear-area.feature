Feature: Crear area (HU1.1)
  Como administrador de talento humano
  Quiero crear nuevas areas dentro de la organizacion
  Para mantener actualizada la estructura institucional

  # CA2: Nombre y descripcion validos -> area almacenada
  Scenario: Creacion exitosa de area con datos validos
    Given que el administrador tiene nombre "Tecnologia" y descripcion "Area de sistemas" validos
    When confirma el registro del area
    Then el sistema almacena el area en la base de datos
    And retorna el registro creado con un identificador unico

  # CA3: Nombre duplicado -> rechazo con mensaje de conflicto
  Scenario: Rechazo por nombre de area duplicado
    Given que ya existe un area registrada con el nombre "Tecnologia"
    When el administrador intenta crear otra area con el nombre "Tecnologia"
    Then el sistema rechaza la creacion con error de conflicto
    And no se crea ningun registro en la base de datos

  # CA5: Nombre con menos de 3 caracteres -> rechazo por longitud
  Scenario: Rechazo por nombre demasiado corto
    Given que el administrador ingresa el nombre "Ti" con menos de 3 caracteres
    When intenta confirmar el registro del area
    Then el sistema rechaza el registro con error de validacion de longitud

  # CA5: Nombre con mas de 100 caracteres -> rechazo por longitud
  Scenario: Rechazo por nombre demasiado largo
    Given que el administrador ingresa un nombre con mas de 100 caracteres
    When intenta confirmar el registro del area
    Then el sistema rechaza el registro con error de validacion de longitud

  # CA6: Nombre con espacios al inicio y final -> trim aplicado antes de validar
  Scenario: Creacion exitosa con espacios removidos del nombre
    Given que el administrador ingresa el nombre "  Contabilidad  " con espacios al inicio y final
    When confirma el registro del area
    Then el sistema elimina los espacios y almacena el area con nombre "Contabilidad"

  # CA8: Nombre vacio -> error de campo obligatorio
  Scenario: Rechazo por nombre vacio
    Given que el administrador deja el campo nombre vacio
    When intenta confirmar el registro del area
    Then el sistema rechaza el registro con error de campo obligatorio

  # CA4: Error tecnico en BD -> excepcion clara sin datos parciales
  Scenario: Error tecnico durante el registro del area
    Given que el administrador tiene nombre "Logistica" y descripcion "Area de logistica" validos
    And ocurre un error de conexion en la base de datos
    When intenta confirmar el registro del area
    Then el sistema lanza una excepcion con un mensaje descriptivo del error
    And no se almacena informacion incompleta
