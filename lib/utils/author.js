const gitName = require('child_process').execSync('git config --global --get user.name').toString().trim()
const gitEmail = require('child_process').execSync('git config --global --get user.email').toString().trim()

module.exports = `${gitName} <${gitEmail}>`
