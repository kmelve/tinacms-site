import React from 'react'
import { useStaticQuery, graphql } from 'gatsby'
import { Helmet } from 'react-helmet'
import { withPlugin } from 'react-tinacms'
import { createRemarkButton } from 'gatsby-tinacms-remark'

import { Page } from 'components/layout/Page'
import IndexLayout from 'layouts'
import BlogList from 'components/blog/BlogList'

const BlogPage = () => {
  const data = useStaticQuery(graphql`
    query BlogPageQuery {
      allMarkdownRemark(
        sort: { fields: [frontmatter___date], order: DESC }
        filter: { fileRelativePath: { glob: "/content/blog/**/*.md" } }
      ) {
        edges {
          node {
            id
            frontmatter {
              title
              author
              date(formatString: "MMMM DD, YYYY")
            }
            excerpt(format: HTML, pruneLength: 200)
            fields {
              slug
            }
          }
        }
      }
    }
  `)
  return (
    <IndexLayout>
      <Helmet>
        <meta property="og:title" content="Blog" />
      </Helmet>
      <BlogList posts={data.allMarkdownRemark.edges} />
    </IndexLayout>
  )
}

const CreateBlogPlugin = createRemarkButton({
  label: 'Add New Blog',
  fields: [
    {
      name: 'title',
      label: 'Title',
      component: 'text',
    },
  ],
  filename: ({ title }) => {
    const slug = title.replace(/\s+/, '-').toLowerCase()

    return `content/blog/${slug}.md`
  },
  frontmatter: ({ title }) => ({
    title,
    date: new Date(),
  }),
  body: () => `Speak your mind.`,
})

export default withPlugin(BlogPage, CreateBlogPlugin)
