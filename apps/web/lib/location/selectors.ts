import rawCitiesMunicipalities from './data/psgc-cities-municipalities.json'
import rawProvinces from './data/psgc-provinces.json'
import {
  DASMARINAS_CITY_NAME,
  DASMARINAS_PROVINCE_NAME,
  DEFAULT_CITY_MUNICIPALITY_NAME,
  DEFAULT_PROVINCE_NAME,
} from './constants'
import type { CityMunicipalityRecord, LocationOption, ProvinceRecord } from './types'

const provinces = rawProvinces as ProvinceRecord[]
const citiesMunicipalities = rawCitiesMunicipalities as CityMunicipalityRecord[]

function normalizeText(value?: string) {
  return (value ?? '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
}

function toCityMunicipalityLabel(record: CityMunicipalityRecord) {
  if (record.isCity && record.name.startsWith('City of ')) {
    return `${record.name.replace(/^City of\s+/i, '').trim()} City`
  }

  return record.name
}

const provinceCodeByName = new Map(
  provinces.map((province) => [normalizeText(province.name), province.code])
)

const provinceNameByCode = new Map(
  provinces.map((province) => [province.code, province.name])
)

const provinceOptions = provinces
  .map((province) => ({ label: province.name, value: province.name }))
  .sort((left, right) => left.label.localeCompare(right.label))

const citiesByProvinceCode = new Map<string, LocationOption[]>()

for (const city of citiesMunicipalities) {
  const cityOptions = citiesByProvinceCode.get(city.provinceCode) ?? []
  cityOptions.push({
    value: toCityMunicipalityLabel(city),
    label: toCityMunicipalityLabel(city),
  })
  citiesByProvinceCode.set(city.provinceCode, cityOptions)
}

for (const [provinceCode, cityOptions] of citiesByProvinceCode) {
  const deduped = Array.from(new Map(cityOptions.map((option) => [option.value, option])).values())
    .sort((left, right) => left.label.localeCompare(right.label))

  citiesByProvinceCode.set(provinceCode, deduped)
}

export function getProvinceOptions() {
  return provinceOptions
}

export function getProvinceCodeByName(provinceName?: string) {
  if (!provinceName) return undefined
  return provinceCodeByName.get(normalizeText(provinceName))
}

export function getProvinceNameByCode(provinceCode?: string) {
  if (!provinceCode) return undefined
  return provinceNameByCode.get(provinceCode)
}

export function getCityMunicipalityOptionsByProvinceName(provinceName?: string) {
  const provinceCode = getProvinceCodeByName(provinceName)
  if (!provinceCode) return []
  return citiesByProvinceCode.get(provinceCode) ?? []
}

export function isDasmarinasSelection(provinceName?: string, cityMunicipalityName?: string) {
  return (
    normalizeText(provinceName) === normalizeText(DASMARINAS_PROVINCE_NAME) &&
    normalizeText(cityMunicipalityName) === normalizeText(DASMARINAS_CITY_NAME)
  )
}

export function getDefaultLocationValues() {
  return {
    province: DEFAULT_PROVINCE_NAME,
    cityMunicipality: DEFAULT_CITY_MUNICIPALITY_NAME,
  }
}
