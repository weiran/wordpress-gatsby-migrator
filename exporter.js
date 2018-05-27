const fs = require('fs-extra')
const fetch = require('node-fetch')

const exportPosts = (posts, rootPath) => {
    if (!rootPath.endsWith('/')) {
        rootPath = rootPath + '/'
    }

    posts.forEach(async post => {
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

module.exports = { exportPosts: exportPosts }