# Blog Migrator from Wordpress Export to Gatsby
Migrate your Wordpress blog to Gatsby. This tool takes a Wordpress export, and produces a local folder structure with the content and images.

* Creates folders and files match post structure
* Converts contents to Markdown and stores in a local folder structure
* Fetches and saves images locally, updating image links in the content
* Supports link posts with a `passthrough_url`

## How to use

Install `npm install -g wordpress-gatsby-migrator`

Run `wordpress-gatsby-migrator INPUT_FILE OUTPUT_DIRECTORY`.

(Example `wordpress-gatsby-migrator input.xml blog`)