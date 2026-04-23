export type ProvinceRecord = {
  code: string
  name: string
  regionCode: string
  islandGroupCode: string
  psgc10DigitCode: string
}

export type CityMunicipalityRecord = {
  code: string
  name: string
  oldName?: string
  isCapital: boolean
  isCity: boolean
  isMunicipality: boolean
  provinceCode: string
  districtCode: string | false
  regionCode: string
  islandGroupCode: string
  psgc10DigitCode: string
}

export type LocationOption = {
  value: string
  label: string
}
