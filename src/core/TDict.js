const fs = require('fs')
const path = require('path')
const deepmerge = require('deepmerge')
const { jsonFlat, jsonUnflat } = require('../plugins/utils')

function settingsToMap(settings) {
  const map = {}
  Object.keys(settings).forEach(key => {
    const item = settings[key]
    const itemMap = {}
    item.forEach(iItem => {
      itemMap[iItem.key] = iItem
    })
    map[key] = itemMap
  })
  return map
}

function mapToSettings(map) {
  const settings = {}
  Object.keys(map).forEach(key => {
    const item = map[key]
    const list = []
    Object.keys(item).forEach(iKey => {
      list.push({
        ...item[iKey]
      })
    })
    settings[key] = list
  })
  return settings
}

class TDict {
  dictPath = ''
  langPath = ''
  i18nSettings = {}

  constructor(options) {
    this.dictPath = options.dictPath || './config'
    this.langPath = options.langPath || './public'
  }

  readByName(name) {
    const filepath = path.resolve(this.dictPath, name)
    let dictData
    try {
      dictData = JSON.parse(fs.readFileSync(`${this.dictPath}/${name}.json`, 'utf8'))
    } catch (e) {
      dictData = {}
    }
    return dictData
  }

  writeByName(name, data) {
    const filepath = path.resolve(this.dictPath, name)
    fs.writeFileSync(`${this.dictPath}/${name}.json`, JSON.stringify(data, null, '\t'))
  }

  writeLang(lang, data) {
    const filepath = path.resolve(this.dictPath, lang)
    fs.writeFileSync(`${this.langPath}/${lang}.json`, JSON.stringify(data, null, '\t'))
  }

  generateLangDict(settings, lang) {
    const langDictList = jsonFlat(this.readByName(lang))
    Object.keys(settings).forEach(key => {
      const item = settings[key]
      item.forEach(iItem => {
        const i18nKey = `${key}.${iItem.key}`
        if (!langDictList[i18nKey]) langDictList[i18nKey] = iItem[`baidu_${lang}`]
      })
    })
  
    return jsonUnflat(langDictList)
  }

  exportSetingsByLang(lang) {
    const map = {}
    const settings = this.readByName('settings')
    Object.keys(settings).forEach(key => {
      const item = settings[key]
      item.forEach(iItem => {
        const i18nKey = `${key}.${iItem.key}`
        if (iItem[`baidu_${lang}`]) map[i18nKey] = iItem[`baidu_${lang}`]
      })
    })

    return map
  }

  updateSettings(i18nSettings) {
    const oSettings = this.readByName('settings')
    this.i18nSettings =  mapToSettings(deepmerge(settingsToMap(i18nSettings), settingsToMap(oSettings)))
    this.writeByName('settings', this.i18nSettings)
  }

  updateLang(lang) {
    this.writeLang(lang, this.generateLangDict(this.i18nSettings, lang))
  }
}

module.exports = TDict
