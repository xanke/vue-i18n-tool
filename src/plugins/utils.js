exports.decodeOriginString = function formatOriginString(str) {
  // str = str.replace(/\./igm, '__')
  return str
}

exports.encodeOriginString = function parseOriginString(str) {
  // str = str.replace(/__/igm, '.')
  return str
}

function jsonFlat(data, k) {
  var jmap = {}
  var expandJson = function(jstr, mapIndex) {
    if (jstr instanceof Array) {
      for (const i in jstr) {
        expandJson(jstr[i], `${mapIndex}[${i}]`)
      }
    } else if (jstr instanceof Object) {
      for (const i in jstr) {
        // 如果mapIndex为false,null,''时，则不加初始索引
        let key
        if (!mapIndex) {
          key = i
        } else {
          key = `${mapIndex}.${i}`
        }
        // Array 是 Object 的子集，先判断是否为 Array,如果是，则不走Object的判断
        if (jstr[i] instanceof Array) {
          for (var j in jstr[i]) {
            expandJson(jstr[i][j], `${key}[${j}]`)
          }
        } else if ((jstr[i] instanceof Object)) {
          expandJson(jstr[i], key)
        } else {
          jmap[key] = jstr[i]
        }
      }
    }
  }
  expandJson(data, k)
  return jmap
}

function jsonUnflat(data) {
  if (Object(data) !== data || Array.isArray(data)) { return data }
  const regex = /\.?([^.\[\]]+)|\[(\d+)\]/g
  const resultholder = {}
  for (const p in data) {
    var cur = resultholder
    let prop = ''
    let m
    while (m = regex.exec(p)) {
      cur = cur[prop] || (cur[prop] = (m[2] ? [] : {}))
      prop = m[2] || m[1]
    }
    cur[prop] = data[p]
  }
  return resultholder[''] || resultholder
}

function objToList(obj) {
  const list = []

  Object.keys(obj).forEach(name => {
    list.push([name, obj[name]])
  })
  return list
}

// function objToList(obj) {
//   const list = []

//   Object.keys(obj).forEach(name => {
//     list.push([name, name.split('.').pop())
//   })
//   return list
// }

function listToObj(list) {
  const obj = {}
  list.forEach(item => {
    const [name, value] = item
    obj[name] = value
  })
  return obj
}

function clearTranslatedList(list) {
  const nList = []
  list.forEach(item => {
    const [, str] = item
    if (str === '' || str === undefined) nList.push(item)
  })

  return nList
}

exports.jsonFlat = jsonFlat
exports.jsonUnflat = jsonUnflat
exports.objToList = objToList
exports.listToObj = listToObj
exports.clearTranslatedList = clearTranslatedList
