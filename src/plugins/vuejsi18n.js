const babelParser = require('@babel/parser')
const traverse = require('@babel/traverse').default
const hasChinese = /[\u4e00-\u9fa5]/
const { decodeOriginString } = require('./utils')

module.exports = vuejsi18n
function vuejsi18n(js, key) {
  let isObject = false
  try {
    if (JSON.stringify(js) && js[0] === '{' && js[js.length - 1] === '}') {
      js = `(${js})`
      isObject = true
    }
  } catch (error) {
    // console.log(error);
  }
  const ast = babelParser.parse(js, {
    range: true,
    sourceType: 'module'
  })

  const nodeList = []
  traverse(ast, {
    enter(path) {
      if (path.isIdentifier({ name: '$t' })) {
        path.stop()
      }
      if (path.isStringLiteral() || path.isDirectiveLiteral() || path.isTemplateElement()) {
        const node = path.node
        let start = node.start
        let end = node.end
        if (isObject) {
          start--
          end--
        }
        nodeList.push({
          type: node.type,
          start,
          end
        })
      }
    }
  })
  if (isObject) {
    js = js.slice(1, -1)
  }
  let transformedContent = ''
  let transformedString = ''
  const originStringList = []
  nodeList
    .sort((a, b) => a.start - b.start)
    .map((node, i) => {
      let originString = js.slice(node.start, node.end)
      if (hasChinese.test(originString)) {
        if (node.type === 'TemplateElement') {
          transformedString = `\${$t('${key}.${decodeOriginString(originString)}')}`
          originStringList.push(originString)
        } else {
          originString = originString.replace(/'/g, '')
          transformedString = `$t('${key}.${decodeOriginString(originString)}')`
          originStringList.push(originString)
        }
      } else {
        transformedString = originString
      }
      const preNode = nodeList[i - 1] || {
        end: 0
      }
      transformedContent += `${js.slice(preNode.end, node.start)}${transformedString}`
      if (i === nodeList.length - 1) {
        transformedContent += js.slice(node.end)
      }
    })

  transformedContent = transformedContent || js
  return [transformedContent, originStringList]
}
