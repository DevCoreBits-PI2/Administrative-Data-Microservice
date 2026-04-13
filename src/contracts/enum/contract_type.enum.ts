export enum contract_type{
  fixed_term_contract = 'fixed_term_contract',            
  indefinite_term_contract = 'indefinite_term_contract', 
  work_or_project_based_contract = 'work_or_project_based_contract', 
  temporary_contract = 'temporary_contract',
  apprenticeship_contract = 'apprenticeship_contract', 
  service_provision_contract = 'service_provision_contract' 
}

export const TypeContractListDto = [
  contract_type.apprenticeship_contract,
  contract_type.fixed_term_contract,
  contract_type.indefinite_term_contract,
  contract_type.service_provision_contract,
  contract_type.temporary_contract,
  contract_type.work_or_project_based_contract
]