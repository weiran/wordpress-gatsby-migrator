const feedRead = require('davefeedread')
const TurndownService = require('turndown')
const turndownService = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced'
})
const cheerio = require('cheerio')
const uuid = require('uuid/v4') // v4 generates random UUIDs
const url = require('url')
const path = require('path')

const importPosts = async (file) => {
    const feed = await parseFeed(file)

    // Filter for only blog posts
    var items = feed.items.filter((item, index) => item['wp:post_type']['#'] === 'post')
    
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

        // Add images array
        const postElements = cheerio.load(mappedItem.content)
        const imagesElements = postElements('img')
        const images = imagesElements.map((index, item) => {
            const imageName = uuid()
            const imageUrl = item.attribs['src']
            const imageExtension = path.extname(url.parse(imageUrl).pathname)
            return {
                url: imageUrl,
                fileName: `${imageName}${imageExtension}`
            }
        }).toArray()

        images.forEach(image => {
            mappedItem.content = mappedItem.content.replace(image.url, image.fileName)
        })
        mappedItem.images = images

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

module.exports = { importPosts: importPosts }