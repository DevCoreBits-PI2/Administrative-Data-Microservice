export enum contract_status{
  valid = 'valid',
  expired = 'expired',
  renewed = 'renewed',
  annulled = 'annulled',
}

export const StatusContractListDto = [
  contract_status.valid,
  contract_status.expired,
  contract_status.renewed,
  contract_status.annulled,
]

export const NON_EDITABLE_STATUSES = [
  contract_status.expired,
  contract_status.renewed,
  contract_status.annulled,
]