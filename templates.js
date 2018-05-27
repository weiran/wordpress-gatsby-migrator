const postTemplate = (title, date, content) => {
    const post = 
`---
title: ${title}
date: "${date}"
---

${content}`
    return post
}

module.exports = { post: postTemplate }