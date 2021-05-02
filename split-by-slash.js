//@ts-check
/**
 *
 * @param {string} text
 */
const splitBySlash = (text) => {
  const textArr = text.split('')

  const indices = textArr.reduce(
    (acc, curr, idx) => {
      let prev = textArr[idx - 1]

      if (curr === '/' && prev && prev !== '\\') {
        return acc.concat(idx)
      }

      return acc
    },
    [-1],
  )

  if (indices.length > 3) {
    throw new Error()
  }

  return indices.map((e, i) => {
    return text.slice(e + 1, indices[i + 1])
  })
}

module.exports = {
  splitBySlash,
}
