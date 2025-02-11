'use strict'

const fs = require('fs')
const path = require('path')

exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions

  // Sometimes, optional fields tend to get not picked up by the GraphQL
  // interpreter if not a single content uses it. Therefore, we're putting them
  // through `createNodeField` so that the fields still exist and GraphQL won't
  // trip up. An empty string is still required in replacement to `null`.

  switch (node.internal.type) {
    case 'MarkdownRemark': {
      const { permalink, layout } = node.frontmatter
      const { relativePath } = getNode(node.parent)

      let slug = permalink

      if (!slug) {
        if (relativePath === 'index.md') {
          // If we have homepage set in docs folder, use it.
          slug = '/'
        } else if (relativePath.endsWith('index.md')) {
          // Use `index.md` as directory index
          slug = `/${relativePath.replace('index.md', '')}`
        } else {
          slug = `/${relativePath.replace('.md', '')}/`
        }
      }

      let section
      const sectionMatch = /^\/?([\w-]+)\//.exec(relativePath)
      if (sectionMatch && sectionMatch[1]) {
        section = sectionMatch[1]
      } else {
        section = 'home'
      }

      // Used to generate URL to view this content.
      createNodeField({
        node,
        name: 'slug',
        value: slug || '',
      })

      // used to determine default page layout
      createNodeField({
        node,
        name: 'section',
        value: section,
      })

      // use to override default page layout
      createNodeField({
        node,
        name: 'layout',
        value: layout || '',
      })
    }
  }
  if (node.internal.type.includes('Json')) {
    let pathRoot = process.cwd()
    let parent = getNode(node.parent)
    createNodeField({
      name: `fileRelativePath`,
      node,
      value: parent.absolutePath.replace(pathRoot, ''),
    })
    //   // console.log(getNode(node.parent))
    //   const { relativePath } = getNode(node.parent)
    //   console.log(relativePath)
    //   createNodeField({
    //     node,
    //     name: 'fileRelativePath',
    //     value: relativePath
    //   })
  }
}

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions

  const allMarkdown = await graphql(`
    {
      allMarkdownRemark(limit: 1000) {
        edges {
          node {
            fields {
              layout
              slug
              section
            }
          }
        }
      }
    }
  `)

  if (allMarkdown.errors) {
    console.error(allMarkdown.errors)
    throw new Error(allMarkdown.errors)
  }

  allMarkdown.data.allMarkdownRemark.edges.forEach(({ node }) => {
    const { slug, layout, section } = node.fields
    createPage({
      path: slug,
      //
      // This will automatically resolve the template to a corresponding
      // layout according to the following hierarchy:
      //
      // - first, it will attempt to use the `layout` value in the content's front matter
      // - if not found, it will use a layout matching the content's section (top-level directory) if it exists.
      //   + note: content without a top-level directory defaults to the 'home' section
      // - finally, if no corresponding layout is found, it will use the layout defined in `page.js`
      //
      component: firstFound([
        path.resolve(`./src/templates/${layout}.js`),
        path.resolve(`./src/templates/${section}.js`),
        path.resolve(`./src/templates/page.js`),
      ]),
      context: {
        // Data passed to context is available in page queries as GraphQL variables.
        slug,
      },
    })
  })
}

const firstFound = paths =>
  paths.reduce((found, path) => {
    if (found) return found
    if (fs.existsSync(path)) return path
    return null
  }, null)
