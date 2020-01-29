const isProduction = process.env.NODE_ENV === 'production'

module.exports = {
    publicPath: isProduction ?
        '/testcase-generator' : '/',
    outputDir: 'testcase-generator',
    productionSourceMap: false
}