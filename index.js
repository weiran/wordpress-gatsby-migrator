const fs = require('fs-extra')
const fetch = require('node-fetch')
const args = require('minimist')(process.argv.slice(2))

const parse = require('./parse.js')

const writeBlog = async (blog, rootPath) => {
    if (!rootPath.endsWith('/')) {
        rootPath = rootPath + '/'
    }

    blog.forEach(async post => {
        const postPath = `${__dirname}/${rootPath}${post.slug}`
        await fs.ensureDir(postPath)

        // // fetch images
        // const postElements = cheerio.load(post.content)
        // const imagesElements = postElements('img')
        // imagesElements.each(async (index, item) => {
        //     try {
        //         const imageUrl = item.attribs['src']
        //         const imageExtension = path.extname(url.parse(imageUrl).pathname)
        //         const imageName = uuid()
        //         const imagePath = `${postPath}/${imageName}${imageExtension}`

        //         const imageResponse = await fetch(imageUrl)
        //         const writeStream = fs.createWriteStream(imagePath)
        //         imageResponse.body.pipe(writeStream)
        //         await streamAsync(writeStream)

        //         // TODO: not working, suspect await isn't working somewhere up
        //         post.content = post.content.replace(imageUrl, `${imageName}${imageExtension}`)
        //         post.markdownContent = post.markdownContent.replace(imageUrl, `${imageName}${imageExtension}`)
        //     }
        //     catch (error) {
        //         console.error(error)
        //     }
        // })

        // create index.md contents
        const fileContents = 
`---
title: ${post.title}
date: "${post.date}"
---

${post.markdownContent}`

        await fs.outputFile(`${postPath}/index.md`, fileContents)
    })
}

const streamAsync = (stream) => {
    return new Promise((resolve, reject) => {
        stream.on('end', () => {
            resolve('end');
        })
        stream.on('finish', () => {
            resolve('finish');
        })
        stream.on('error', (error) => {
            reject(error);
        })
    })
}

const runner = async () => {
    // const file =  fs.readFileSync(__dirname + '/squarespace.xml', 'utf8')
    const inputFile = args._[0]
    const file = fs.readFileSync(inputFile, 'utf8')
    const blog = await parse.parse(file)
    await writeBlog(blog, 'blogs')
}

runner()