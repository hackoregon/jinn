const rootPkgName = require('./rootPkgName.js')

describe('rootPkgName', function () {
  it('should get the name of the app from package.json', function () {
    expect(rootPkgName).to.eql('jinn')
  })
})
