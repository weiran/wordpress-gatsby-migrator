const fs = require('fs-extra')
const args = require('minimist')(process.argv.slice(2))

const importer = require('./importer.js')
const exporter = require('./exporter.js')

const runner = async () => {
    const inputFile = args._[0]
    const file = fs.readFileSync(inputFile, 'utf8')
    
    const posts = await importer.importPosts(file)
    await exporter.exportPosts(posts, 'blogs')
}

runner()