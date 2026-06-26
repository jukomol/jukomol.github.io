#!/usr/bin/env node

/**
 * Sync GitHub Issues to Jekyll Collections
 * 
 * This script fetches issues from a GitHub repository and converts them
 * to Jekyll content based on their labels:
 * - bio → _data/bio.yml
 * - cv → updates _data/bio.yml with CV download link
 * - post → _posts/YYYY-MM-DD-slug.md
 * - pub → _pubs/slug.md
 * - presentation → _talks/slug.md
 * - resource → _resources/slug.md
 * - contact → _data/contact.yml
 */

import { graphql } from '@octokit/graphql';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Configuration
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = process.env.GITHUB_REPOSITORY?.split('/')[0] || 'jukomol';
const REPO_NAME = process.env.GITHUB_REPOSITORY?.split('/')[1] || 'site';

// Mock data for testing without API access
const MOCK_DATA = {
  repository: {
    issues: {
      nodes: [
        {
          title: "Bio Information",
          body: `---
name: "Jahir Uddin"
title: "Graduate Research Assistant"
affiliation: "University of Nebraska Medical Center"
email: "juddin@unmc.edu"
bio_short: "Physical AI researcher specializing in Human Factor Engineering and Occupational Safety."
bio_full: |
  Jahir Uddin is a Graduate Research Assistant at the University of Nebraska Medical Center.
  His research focuses on Physical AI, Human Factor Engineering, Occupational Safety, 
  Ag-Robotics, and Digital Twin technologies and their applications in healthcare and agriculture.
research_interests:
  - "Physical AI"
  - "Human Factor Engineering"
  - "Occupational Safety"
  - "Ag-Robotics"
  - "Digital Twin"
profile_image: "/assets/images/profile.jpg"
download_cv: "/assets/cv/Jahir_Uddin_CV.pdf"
links:
  github: "jukomol"
  scholar: ""
  orcid: ""
---

Additional bio content can go here.`,
          createdAt: "2024-01-15T10:00:00Z",
          updatedAt: "2024-01-15T10:00:00Z",
          labels: {
            nodes: [{ name: "bio" }]
          }
        },
        {
          title: "Example Publication: Deep Learning for NLP",
          body: `---
title: "Deep Learning Approaches for Natural Language Processing"
authors:
  - "Jane Smith"
  - "John Doe"
venue: "Conference on Computational Linguistics (ACL 2023)"
date: 2023-07-15
abstract: "This paper presents novel deep learning approaches for natural language processing tasks."
pdf: "https://example.com/paper.pdf"
doi: "10.1234/acl.2023.1234"
tags:
  - "NLP"
  - "Deep Learning"
  - "Machine Learning"
---

# Deep Learning Approaches for Natural Language Processing

This is the full content of the publication with additional details, figures, and results.`,
          createdAt: "2024-01-20T10:00:00Z",
          updatedAt: "2024-01-20T10:00:00Z",
          labels: {
            nodes: [{ name: "pub" }]
          }
        },
        {
          title: "Invited Talk at AI Conference 2024",
          body: `---
title: "The Future of Natural Language Processing"
event: "AI Conference 2024"
location: "San Francisco, CA"
date: 2024-03-15
slides: "https://example.com/slides.pdf"
video: "https://youtube.com/watch?v=example"
tags:
  - "NLP"
  - "AI"
  - "Invited Talk"
---

# Talk Abstract

An overview of current trends and future directions in natural language processing research.`,
          createdAt: "2024-02-01T10:00:00Z",
          updatedAt: "2024-02-01T10:00:00Z",
          labels: {
            nodes: [{ name: "presentation" }]
          }
        },
        {
          title: "NLP Dataset for Healthcare",
          body: `---
title: "Medical Text Classification Dataset"
resource_type: "Dataset"
date: 2023-12-01
link: "https://github.com/example/dataset"
description: "A curated dataset for medical text classification tasks."
tags:
  - "Dataset"
  - "Healthcare"
  - "NLP"
---

# Dataset Description

This dataset contains labeled medical texts for classification tasks.`,
          createdAt: "2024-01-10T10:00:00Z",
          updatedAt: "2024-01-10T10:00:00Z",
          labels: {
            nodes: [{ name: "resource" }]
          }
        },
        {
          title: "Getting Started with NLP Research",
          body: `---
title: "Getting Started with NLP Research"
date: 2024-01-05
author: "Jane Smith"
tags:
  - "NLP"
  - "Research"
  - "Tutorial"
---

# Introduction

This post provides tips and resources for those starting their journey in NLP research.

## Resources

- Papers to read
- Tools and frameworks
- Online courses`,
          createdAt: "2024-01-05T10:00:00Z",
          updatedAt: "2024-01-05T10:00:00Z",
          labels: {
            nodes: [{ name: "post" }]
          }
        },
        {
          title: "Contact Information",
          body: `---
email: "juddin@unmc.edu"
office: ""
office_hours: ""
social:
  twitter: ""
  github: "https://github.com/jukomol"
  linkedin: ""
  scholar: ""
---

Feel free to reach out via email!`,
          createdAt: "2024-01-25T10:00:00Z",
          updatedAt: "2024-01-25T10:00:00Z",
          labels: {
            nodes: [{ name: "contact" }]
          }
        }
      ]
    }
  }
};

/**
 * Extract YAML front matter and content from issue body
 */
function parseFrontMatter(body) {
  const frontMatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = body.match(frontMatterRegex);
  
  if (!match) {
    return {
      frontMatter: '',
      content: body
    };
  }
  
  return {
    frontMatter: match[1].trim(),
    content: match[2].trim()
  };
}

/**
 * Create a slug from title
 */
function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim();
}

/**
 * Ensure directory exists
 */
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Process bio issue
 */
function processBio(discussion) {
  console.log('Processing bio issue...');
  const { frontMatter, content } = parseFrontMatter(discussion.body);
  
  const bioPath = path.join(rootDir, '_data', 'bio.yml');
  
  // Write the bio data
  let bioContent = frontMatter;
  if (content) {
    bioContent += '\n\n# Additional content from issue\n# ' + content.split('\n').join('\n# ');
  }
  
  fs.writeFileSync(bioPath, bioContent);
  console.log(`✓ Updated bio: ${bioPath}`);
}

/**
 * Process CV issue
 */
function processCV(discussion) {
  console.log('Processing CV issue...');
  const { frontMatter } = parseFrontMatter(discussion.body);
  
  // Extract download_cv URL from front matter
  const cvUrlMatch = frontMatter.match(/download_cv:\s*["']?([^"'\n]+)["']?/);
  if (!cvUrlMatch) {
    console.log('  No download_cv URL found in CV issue');
    return;
  }
  
  const bioPath = path.join(rootDir, '_data', 'bio.yml');
  
  if (fs.existsSync(bioPath)) {
    let bioContent = fs.readFileSync(bioPath, 'utf8');
    
    // Update or add download_cv field
    if (bioContent.includes('download_cv:')) {
      bioContent = bioContent.replace(/download_cv:.*$/m, `download_cv: "${cvUrlMatch[1]}"`);
    } else {
      bioContent += `\n\ndownload_cv: "${cvUrlMatch[1]}"`;
    }
    
    fs.writeFileSync(bioPath, bioContent);
    console.log(`✓ Updated CV link in bio: ${bioPath}`);
  }
}

/**
 * Process post issue
 */
function processPost(discussion) {
  console.log(`Processing post: ${discussion.title}`);
  const { frontMatter, content } = parseFrontMatter(discussion.body);
  
  // Extract date from front matter or use creation date
  const dateMatch = frontMatter.match(/date:\s*(\d{4}-\d{2}-\d{2})/);
  const date = dateMatch ? dateMatch[1] : discussion.createdAt.split('T')[0];
  
  const slug = slugify(discussion.title);
  const filename = `${date}-${slug}.md`;
  const postsDir = path.join(rootDir, '_posts');
  ensureDir(postsDir);
  
  const postPath = path.join(postsDir, filename);
  const postContent = `---\n${frontMatter}\n---\n\n${content}`;
  
  fs.writeFileSync(postPath, postContent);
  console.log(`✓ Created post: ${postPath}`);
}

/**
 * Process publication issue
 */
function processPub(discussion) {
  console.log(`Processing publication: ${discussion.title}`);
  const { frontMatter, content } = parseFrontMatter(discussion.body);
  
  const slug = slugify(discussion.title);
  const filename = `${slug}.md`;
  const pubsDir = path.join(rootDir, '_pubs');
  ensureDir(pubsDir);
  
  const pubPath = path.join(pubsDir, filename);
  const pubContent = `---\n${frontMatter}\n---\n\n${content}`;
  
  fs.writeFileSync(pubPath, pubContent);
  console.log(`✓ Created publication: ${pubPath}`);
}

/**
 * Process presentation issue
 */
function processPresentation(discussion) {
  console.log(`Processing presentation: ${discussion.title}`);
  const { frontMatter, content } = parseFrontMatter(discussion.body);
  
  const slug = slugify(discussion.title);
  const filename = `${slug}.md`;
  const talksDir = path.join(rootDir, '_talks');
  ensureDir(talksDir);
  
  const talkPath = path.join(talksDir, filename);
  const talkContent = `---\n${frontMatter}\n---\n\n${content}`;
  
  fs.writeFileSync(talkPath, talkContent);
  console.log(`✓ Created presentation: ${talkPath}`);
}

/**
 * Process resource issue
 */
function processResource(discussion) {
  console.log(`Processing resource: ${discussion.title}`);
  const { frontMatter, content } = parseFrontMatter(discussion.body);
  
  const slug = slugify(discussion.title);
  const filename = `${slug}.md`;
  const resourcesDir = path.join(rootDir, '_resources');
  ensureDir(resourcesDir);
  
  const resourcePath = path.join(resourcesDir, filename);
  const resourceContent = `---\n${frontMatter}\n---\n\n${content}`;
  
  fs.writeFileSync(resourcePath, resourceContent);
  console.log(`✓ Created resource: ${resourcePath}`);
}

/**
 * Process contact issue
 */
function processContact(issue) {
  console.log('Processing contact issue...');
  const { frontMatter, content } = parseFrontMatter(issue.body);
  
  const contactPath = path.join(rootDir, '_data', 'contact.yml');
  
  // Write the contact data
  let contactContent = frontMatter;
  if (content) {
    contactContent += '\n\n# Additional content from issue\n# ' + content.split('\n').join('\n# ');
  }
  
  fs.writeFileSync(contactPath, contactContent);
  console.log(`✓ Updated contact: ${contactPath}`);
}

/**
 * Fetch issues from GitHub
 */
async function fetchIssues() {
  if (!GITHUB_TOKEN) {
    console.log('⚠ No GITHUB_TOKEN found, using mock data for testing');
    return MOCK_DATA;
  }
  
  const query = `
    query($owner: String!, $name: String!) {
      repository(owner: $owner, name: $name) {
        issues(first: 100, states: OPEN) {
          nodes {
            title
            body
            createdAt
            updatedAt
            labels(first: 10) {
              nodes {
                name
              }
            }
          }
        }
      }
    }
  `;
  
  try {
    const data = await graphql(query, {
      owner: REPO_OWNER,
      name: REPO_NAME,
      headers: {
        authorization: `token ${GITHUB_TOKEN}`,
      },
    });
    
    return data;
  } catch (error) {
    console.error('Error fetching issues:', error.message);
    console.log('Falling back to mock data...');
    return MOCK_DATA;
  }
}

/**
 * Main sync function
 */
async function sync() {
  console.log('🔄 Starting GitHub Issues sync...\n');
  
  const data = await fetchIssues();
  const issues = data.repository.issues.nodes;
  
  console.log(`Found ${issues.length} issues\n`);
  
  for (const issue of issues) {
    const labels = issue.labels.nodes.map(l => l.name);
    
    if (labels.includes('bio')) {
      processBio(issue);
    } else if (labels.includes('cv')) {
      processCV(issue);
    } else if (labels.includes('post')) {
      processPost(issue);
    } else if (labels.includes('pub')) {
      processPub(issue);
    } else if (labels.includes('presentation')) {
      processPresentation(issue);
    } else if (labels.includes('resource')) {
      processResource(issue);
    } else if (labels.includes('contact')) {
      processContact(issue);
    } else {
      console.log(`⊘ Skipping issue without recognized type label: ${issue.title}`);
    }
  }
  
  console.log('\n✅ Sync completed successfully!');
}

/**
 * Commit changes if running in CI
 */
function commitChanges() {
  if (!process.env.CI) {
    console.log('\nℹ Not in CI environment, skipping git commit');
    return;
  }
  
  try {
    // Check if there are changes
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    
    if (!status.trim()) {
      console.log('\nℹ No changes to commit');
      return;
    }
    
    console.log('\n📝 Committing changes...');
    
    execSync('git config user.name "github-actions[bot]"');
    execSync('git config user.email "github-actions[bot]@users.noreply.github.com"');
    execSync('git add _data/ _posts/ _pubs/ _talks/ _resources/');
    execSync('git commit -m "Sync content from GitHub Issues"');
    
    console.log('✓ Changes committed');
  } catch (error) {
    console.error('Error committing changes:', error.message);
  }
}

// Run the sync
sync()
  .then(() => {
    commitChanges();
  })
  .catch(error => {
    console.error('Sync failed:', error);
    process.exit(1);
  });
