const fs = require('fs-extra')
const path = require('path')
const feedRead = require('davefeedread')
const TurndownService = require('turndown')
const turndownService = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced'
})
const cheerio = require('cheerio')
const fetch = require('node-fetch')
const uuid = require('uuid/v4') // v4 generates random UUIDs
const url = require('url')

const parseBlog = async (file) => {
    const feed = await parseFeed(file)

    // Filter for only blog posts
    var items = feed.items.filter((item, index, array) => item['wp:post_type']['#'] === 'post')
    
    // Map to new object type
    items = items.map(item => {
        if (item['wp:post_type']['#'] !== 'post') {
            return
        }

        const mappedItem = {
            'title': item.title,
            'date': item.date,
            'content': item['content:encoded']['#'],
            'categories': item.categories,
            'slug': item['wp:post_name']['#']
        }

        // Add passthroughUrl if exists
        const postMeta = item['wp:postmeta']
        if (postMeta) {
            const metaKey = postMeta['wp:meta_key']['#']
            if (metaKey == "passthrough_url") {
                mappedItem.passthroughUrl = postMeta['wp:meta_value']['#']
            }
        }

        return mappedItem
    })

    // Add Markdown conversion
    items = items.map(item => {
        item.markdownContent = turndownService.turndown(item.content)
        return item
    })

    return items
}

const parseFeed = (file) => {
    return new Promise((resolve, reject) => {
        feedRead.parseString(file, undefined, (error, result) => {
            if (error) {
                reject(error)
            } else {
                resolve(result)
            }
        })
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

const writeBlog = async (blog, rootPath) => {
    if (!rootPath.endsWith('/')) {
        rootPath = rootPath + '/'
    }

    blog.forEach(async post => {
        const postPath = `${__dirname}/${rootPath}${post.slug}`
        await fs.ensureDir(postPath)

        // fetch images
        const postElements = cheerio.load(post.content)
        const imagesElements = postElements('img')
        imagesElements.each(async (index, item) => {
            try {
                const imageUrl = item.attribs['src']
                const imageExtension = path.extname(url.parse(imageUrl).pathname)
                const imageName = uuid()
                const imagePath = `${postPath}/${imageName}${imageExtension}`

                const imageResponse = await fetch(imageUrl)
                const writeStream = fs.createWriteStream(imagePath)
                imageResponse.body.pipe(writeStream)
                await streamAsync(writeStream)

                // TODO: not working, suspect await isn't working somewhere up
                post.content = post.content.replace(imageUrl, `${imageName}${imageExtension}`)
                post.markdownContent = post.markdownContent.replace(imageUrl, `${imageName}${imageExtension}`)
            }
            catch (error) {
                console.error(error)
            }
        })

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

const runner = async () => {
    const file =  fs.readFileSync(__dirname + '/squarespace.xml', 'utf8')
    const blog = await parseBlog(file)
    await writeBlog(blog, 'blogs')
}

runner()