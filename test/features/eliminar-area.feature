Feature: Eliminar area (HU1.3)
  Como administrador
  Quiero eliminar un area
  Para depurar la estructura organizacional cuando deje de existir

  # CA2: Area inexistente -> error not found
  Scenario: Rechazo por eliminacion de area inexistente
    Given que no existe ninguna area con id 999
    When el administrador intenta eliminar el area con id 999
    Then el sistema retorna error indicando que el area no fue encontrada

  # CA3: Area con cargos asociados -> bloqueo de eliminacion
  Scenario: Bloqueo de eliminacion por cargos asociados al area
    Given que existe un area con id 2 que tiene 3 cargos asociados
    When el administrador intenta eliminar el area con id 2
    Then el sistema bloquea la operacion indicando que el area tiene cargos vinculados
    And no se elimina ni modifica el area

  # CA5 + CA7: Area sin cargos -> eliminacion logica (status inactive)
  Scenario: Eliminacion logica exitosa de area sin cargos
    Given que existe un area con id 1 sin cargos asociados
    When el administrador elimina el area con id 1
    Then el sistema marca el area como inactiva en la base de datos
    And retorna mensaje de confirmacion de eliminacion exitosa

  # CA9: Area eliminada no aparece en consultas activas
  Scenario: Area inactiva no aparece en consultas de areas activas
    Given que el area con id 1 fue eliminada logicamente con status "inactive"
    When se consultan las areas con filtro de status "active"
    Then el area con id 1 no aparece en los resultados

  # CA10: Error tecnico durante eliminacion
  Scenario: Error tecnico durante la eliminacion del area
    Given que existe un area con id 1 sin cargos asociados
    And ocurre un error de conexion al intentar eliminar
    When el administrador intenta eliminar el area con id 1
    Then el sistema lanza una excepcion descriptiva del error
    And el area no es modificada
