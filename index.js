const fs = require('fs-extra')
const fetch = require('node-fetch')
const args = require('minimist')(process.argv.slice(2))

const parse = require('./parse.js')
const templates = require('./templates.js')
const utilities = require('./utilities.js')

const writeBlog = async (blog, rootPath) => {
    if (!rootPath.endsWith('/')) {
        rootPath = rootPath + '/'
    }

    blog.forEach(async post => {
        const postPath = `${__dirname}/${rootPath}${post.slug}`
        await fs.ensureDir(postPath)

        post.images.forEach(async image => {
            const imageResponse = await fetch(image.url)
            const writeStream = fs.createWriteStream(`${postPath}/${image.fileName}`)
            imageResponse.body.pipe(writeStream)
            await utilities.streamAsync(writeStream)
        })

        const fileContents = templates.post(post.title, post.date, post.markdownContent)
        await fs.outputFile(`${postPath}/index.md`, fileContents)
    })
}

const runner = async () => {
    const inputFile = args._[0]
    const file = fs.readFileSync(inputFile, 'utf8')
    const blog = await parse.parse(file)
    await writeBlog(blog, 'blogs')
}

runner()