const postTemplate = (title, date, passthroughUrl, content) => {
    const post = 
`---
title: "${title}"
date: "${date}"${passthroughUrl ? `
passthroughUrl: ${passthroughUrl}` : ''}
---

${content}`
    return post
}

module.exports = { post: postTemplate }