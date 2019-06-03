import lang from 'lang/en_US'
import racpiIdToDepartmentMap from 'data/racpiIdToDepartmentMap.json'

export const formStepShortNames = Object.keys(lang.formSteps)

export const departments = [
  ...(
    // Convert to a set to deduplicate departments
    new Set(
      Object.keys(racpiIdToDepartmentMap)
        .map(key => racpiIdToDepartmentMap[key])
        .sort())
      .values()
  )
]

export const titles = [
  'Academic/Research Asst/Assoc',
  'Adjunct Lecturer',
  'Assistant Professor',
  'Assistant Professor In Residence',
  'Associate Professor',
  'Associate Professor In Residence',
  'Asst/Assoc/Full Clinical Professor',
  'Asst/Assoc/Full Ext. Professor',
  'Asst/Assoc/Full Research Professor',
  'Cooperative Ext. Educator In Residence',
  'Cooperative Extension Educator',
  'Emeritus',
  'Instructor (Asst., In-Residence, Clinical)',
  'Law Professor',
  'Lecturer',
  'Professor',
  'Professor In Residence'
]

export const participationLevels = [
  'Active Participation',
  'Attendance Only'
]

export const primaryMethodsOfTravel = [
  'Airfare',
  'Bus',
  'Personal Car',
  'Train'
]

export const guidelinesUrl = 'https://ovpr.uconn.edu/services/research-development/faculty-travel'
