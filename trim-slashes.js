/**
 *
 * @param {string} text
 */
const trimSlashes = (text) => text.replace(/^\/+/, '').replace(/\/+$/, '')

module.exports = {
  trimSlashes,
}
