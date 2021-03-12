const compiler = require('vue-template-compiler')
const vuetemplatei18n = require('../plugins/vuetemplatei18n')
const vuejsi18n = require('../plugins/vuejsi18n')

const Processes = {
  vue: compileVueMiddleware,
  js: function(file) {
    const i18nList = []
    const [updated, originList] = vuejsi18n(file.content, file.key)
    file.content = updated
    i18nList.push(...originList)

    file.i18nList = i18nList
    return file
  }
}

// 需多次解析，避免错误
let parse
function compileVueMiddleware(file) {
  const i18nList = []
  parse = compiler.parseComponent(file.content)
  // Template
  if (parse.template) {
    const [updated, originList = []] = vuetemplatei18n(parse.template.content, file.key)
    file.content = file.content.slice(0, parse.template.start) + updated + file.content.slice(parse.template.end)
    i18nList.push(...originList)
  }
  // Script
  parse = compiler.parseComponent(file.content)
  if (parse.script) {
    const [updated, originList] = vuejsi18n(parse.script.content, file.key)
    file.content = file.content.slice(0, parse.script.start) + updated + file.content.slice(parse.script.end)
    i18nList.push(...originList)
  }
  parse = compiler.parseComponent(file.content)
  file.i18nList = i18nList
  return file
}

module.exports = Processes
