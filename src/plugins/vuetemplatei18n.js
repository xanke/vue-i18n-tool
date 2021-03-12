const parse5 = require('parse5')
const he = require('he')
const { parseText } = require('../vue-utils/parseText')
const { parseFilters } = require('../vue-utils/parseFilters')
const dirRE = /^v-|^@|^:/
const vuejsi18n = require('./vuejsi18n')
const { decodeOriginString } = require('./utils')

const hasChinese = /[\u4e00-\u9fa5]/

module.exports = vuetemplatei18n

function vuetemplatei18n(templateContent, key) {
  const ast = parse5.parse(templateContent, {
    sourceCodeLocationInfo: true
  })
  let nodeList = []
  const originStringList = []
  let transformedContent = ''
  analysisAst(ast, nodeList)
  nodeList = filterNodeList(nodeList)
  nodeList
    .sort((before, after) => before.start - after.start)
    .map((node, i) => {
      let originString = templateContent.slice(node.start, node.end)
      let transformedString = ''
      if (node.type === 'text') {
        const hasToken = !!parseText(originString)
        if (hasToken) {
          const { tokens } = parseText(originString)
          tokens.map((token, i) => {
            let tokenTransformed = ''
            if (token.type === 'static') {
              token.binding = token.binding.replace(/^\s{1,}/g, '')
              token.start = token.end - token.binding.length
              token.binding = token.binding.replace(/\s{1,}$/g, '')
              token.end = token.start + token.binding.length
              if (isEmpty(token.binding) || !hasChinese.test(token.binding)) {
                tokenTransformed = token.binding
              } else {
                tokenTransformed = `{{$t('${key}.${decodeOriginString(token.binding)}')}}`
                originStringList.push(token.binding)
              }
            } else {
              tokenTransformed = originString
                .slice(token.start, token.end)
                .replace(token.binding, vuejsi18n(token.binding, key)[0])
            }
            const preToken = tokens[i - 1] || {
              end: 0
            }
            transformedString += `${originString.slice(preToken.end, token.start)}${tokenTransformed}`
            if (i === tokens.length - 1) {
              transformedString += originString.slice(token.end)
            }
          })
        } else {
          if (hasChinese.test(originString)) {
            originString = originString.replace(/^\s{1,}/g, '')
            node.start = node.end - originString.length
            originString = originString.replace(/\s{1,}$/g, '')
            node.end = node.start + originString.length
            transformedString = `{{$t('${key}.${decodeOriginString(originString)}')}}`
            originStringList.push(originString)
          } else {
            transformedString = originString
          }
        }
      }
      if (node.type === 'directive') {
        const value = parseFilters(originString.slice(originString.indexOf('=') + 2, -1))
        transformedString = originString.replace(value, vuejsi18n(value, key)[0])
      }
      if (node.type === 'attr') {
        const value = originString.slice(originString.indexOf('=') + 2, -1)
        if (hasChinese.test(value)) {
          transformedString = `:${originString.replace(value, `$t('${key}.${decodeOriginString(value)}')`)}`
          originStringList.push(value)
        } else {
          transformedString = originString
        }
      }
      const preNode = nodeList[i - 1] || {
        end: 0
      }
      transformedContent += `${templateContent.slice(preNode.end, node.start)}${transformedString}`
      if (i === nodeList.length - 1) {
        transformedContent += templateContent.slice(node.end)
      }
    })
  transformedContent = transformedContent || templateContent
  return [transformedContent, originStringList]
}

function isEmpty(value) {
  return !he.decode(value).trim()
}

function analysisAst(ast, nodeList) {
  ast.attrs && ast.sourceCodeLocation && ast.sourceCodeLocation.attrs &&
    ast.attrs.map(attr => {
      if (isEmpty(attr.value)) {
        return
      }
      const type = dirRE.test(attr.name) ? 'directive' : 'attr'
      let attrIndex = attr.name

      // deal template like this <use xlink: href="中文"></use>
      if (attr.prefix) {
        attrIndex = attr.prefix + ':' + attrIndex
      }
      nodeList.push({
        start: ast.sourceCodeLocation.attrs[attrIndex].startOffset,
        end: ast.sourceCodeLocation.attrs[attrIndex].endOffset,
        type
      })
    })
  if (ast.nodeName === '#text' && ast.sourceCodeLocation) {
    if (isEmpty(ast.value)) {
      return
    }
    nodeList.push({
      start: ast.sourceCodeLocation.startOffset,
      end: ast.sourceCodeLocation.endOffset,
      type: 'text'
    })
  }
  ast.childNodes &&
    ast.childNodes.map(childNode => {
      analysisAst(childNode, nodeList)
    })
  ast.content &&
    ast.content.childNodes.map(childNode => {
      analysisAst(childNode, nodeList)
    })
}

function filterNodeList(nodeList) {
  const list = []
  const unique = new Set()
  nodeList.forEach((item, index) => {
    const num = `${item.start}-${item.end}`

    if (!unique.has(num)) list.push(item)
    unique.add(num)
  })
  return list
}
