const fs = require('fs')
const { jsonFlat, jsonUnflat } = require('./utils')

function mergeDict(data, lang) {
  return jsonUnflat({
    ...jsonFlat(data),
    ...jsonFlat(readDict(lang))
  })
}

function initDictByComponentData(componentData) {
  const data = {}
  Object.keys(componentData).forEach(componentName => {
    const itemData = componentData[componentName]
    const nItemData = {}
    Object.keys(itemData).forEach(name => {
      nItemData[name] = name
    })
    data[componentName] = nItemData
  })
  return data
}

function readDict(lang) {
  let dictData
  try {
    dictData = JSON.parse(fs.readFileSync(`./config/dict/${lang}.json`, 'utf8'))
  } catch (e) {
    dictData = {}
  }
  return dictData
}

function writeDict(data, lang) {
  fs.writeFileSync(`./config/dict/${lang}.json`, JSON.stringify(data, null, '\t'))
}

async function mergeDictJs(path, data) {
  let dictData = {}
  const nData = {}
  try {
    // eslint-disable-next-line no-eval
    dictData = eval(fs.readFileSync(path, 'utf8'))
  } catch (e) {
    dictData = {}
  }

  dictData = jsonFlat(dictData)
  Object.keys(data).forEach(key => {
    nData[key] = dictData[key] || ''
  })

  return nData
}

function exportSetingsByLang(lang) {
  const map = {}
  const settings = readDict('settings')

  Object.keys(settings).forEach(key => {
    const item = settings[key]
    item.forEach(iItem => {
      const i18nKey = `${key}.${iItem.key}`
      if (iItem[`baidu_${lang}`]) map[i18nKey] = iItem[`baidu_${lang}`]
    })
  })

  return map
}

exports.exportSetingsByLang = exportSetingsByLang
exports.initDictByComponentData = initDictByComponentData
exports.mergeDict = mergeDict
exports.readDict = readDict
exports.writeDict = writeDict
exports.mergeDictJs = mergeDictJs
