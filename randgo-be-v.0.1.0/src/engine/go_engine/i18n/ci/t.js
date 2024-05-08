const index = require('../src')

for (let locale in index) {
  require(`../src/${locale}.i18n.js`)
}
