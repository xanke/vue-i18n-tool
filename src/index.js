const fs = require('fs')
const path = require('path')
const glob = require('glob')
const { listToObj } = require('./plugins/utils')
const { formatStr } = require('./utils/format')
const { generateZhDict, mergeDictBySettings } = require('./utils/generateDict')
const TFile = require('./core/TFile')
const TApi = require('./core/TApi')
const TDict = require('./core/TDict')
const Processes = require('./core/processes')

function replaceMark(str, replaces) {
  str = str.split(path.sep).join('__')
  Object.keys(replaces).forEach(key => {
    str = str.replace(key.replace('/', '__'), replaces[key])
  })

  return str.replace(/(.js|.vue)/igm, '')
}

function contentReplaceKey(content, i18nList) {
  const list = []
  i18nList.forEach((item) => {
    const key = formatStr(item)
    content = content.replace(item, key)
    list.push({
      key,
      content: item
    })
  })
  return { list, content }
}

function handleWriteSettingsTranslate(settings, transList, lang) {
  const transMap = listToObj(transList)
  Object.keys(settings).forEach(key => {
    const item = settings[key]
    item.forEach(iItem => {
      const i18nKey = `${key}.${iItem.key}`
      if (transMap[i18nKey]) iItem[`baidu_${lang}`] = transMap[i18nKey]
    })
  })
}

class main{
  i18nContent = {}
  config = {}

  constructor(config) {
    const { basePath, filePaths, skipFiles } = config
    this.config = config
    this.tDict = new TDict({
      dictPath: config.dictPath
    })

    this.tFile = new TFile({
      basePath,
      filePaths,
      skipFiles
    })

    this.tApi = new TApi({
      from: config.from,
      to: config.to,
      appid: config.appid,
      token: config.token,
      qtime: config.qtime
    })
  }

  scanDir() {
    const componentList = this.tFile.mapDir()
    return componentList
  }

  async start() {
    const i18nSettings = {}
    const i18nContent = {}
    const componentList= this.scanDir()
    const lang = this.config.to

    componentList.map(filePath => {
      const content = fs.readFileSync(filePath, 'utf8')
      const extname = path.extname(filePath).slice(1)
  
      const key = replaceMark(filePath, this.config.keyReplace)
      const file = Processes[extname]({
        content,
        filePath,
        key
      })
  
      if (file.i18nList.length) {
        const data = {}
        file.i18nList.forEach(name => {
          data[name] = ''
        })
  
        i18nContent[key] = data
  
        const { content: fileContent, list: settingList } = contentReplaceKey(file.content, file.i18nList)
        file.content = fileContent
        i18nSettings[key] = settingList
      }

      fs.writeFileSync(file.filePath, file.content)
    })
  
    this.tDict.writeLang('zh', generateZhDict(i18nSettings))

    const waitTranslateList = mergeDictBySettings(i18nSettings, this.tDict.exportSetingsByLang(lang), lang)
    const transList = await this.tApi.translateList(waitTranslateList, lang)
    handleWriteSettingsTranslate(i18nSettings, transList, lang)
  
    this.tDict.updateSettings(i18nSettings)
    this.tDict.updateLang(lang)
  }
}

module.exports = main
