Feature: Editar area (HU1.2)
  Como administrador
  Quiero modificar la informacion de un area existente
  Para mantener actualizada la estructura organizacional

  # CA1: Area inexistente -> error not found
  Scenario: Rechazo por edicion de area que no existe
    Given que no existe ninguna area con id 999
    When el administrador intenta editar el area con id 999
    Then el sistema retorna error indicando que el area no fue encontrada

  # CA5 + CA6: Nombre con espacios -> trim + validacion de longitud
  Scenario: Edicion exitosa con espacios removidos del nombre
    Given que existe un area con id 1 y nombre "Recursos Humanos"
    When el administrador actualiza el nombre a "  Nomina  " con espacios
    Then el sistema guarda el area con el nombre recortado "Nomina"

  # CA4 + CA8: Nombre vacio o nulo -> rechazo
  Scenario: Rechazo por nombre vacio en edicion
    Given que existe un area con id 1 y nombre "Recursos Humanos"
    When el administrador intenta actualizar el nombre con menos de 3 caracteres "ab"
    Then el sistema rechaza la edicion con error de longitud invalida
    And no se modifica ningun dato en la base de datos

  # CA7 + CA8: Nombre ya usado por otro area -> conflicto
  Scenario: Rechazo por nombre duplicado en edicion
    Given que existe un area con id 1 y nombre "Recursos Humanos"
    And existe otra area diferente con el nombre "Tecnologia"
    When el administrador intenta cambiar el nombre del area con id 1 a "Tecnologia"
    Then el sistema bloquea la operacion con error de nombre duplicado
    And no se modifica ningun dato en la base de datos

  # CA10: Todas las validaciones pasan -> actualizacion en BD
  Scenario: Edicion exitosa con datos validos
    Given que existe un area con id 1 y nombre "Recursos Humanos"
    When el administrador actualiza el nombre a "Gestion Humana" y descripcion a "Nueva descripcion"
    Then el sistema actualiza el area correctamente en la base de datos
    And retorna los datos actualizados del area

  # CA15: Error tecnico en BD durante actualizacion
  Scenario: Error tecnico durante la edicion del area
    Given que existe un area con id 1 y nombre "Recursos Humanos"
    And ocurre un error de conexion al intentar actualizar
    When el administrador intenta guardar los cambios del area con id 1
    Then el sistema lanza una excepcion descriptiva
    And no quedan cambios parciales aplicados
