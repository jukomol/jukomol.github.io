# Academic Portfolio Website

A responsive academic website built with Jekyll and Tailwind CSS that syncs content from GitHub Issues and publishes to GitHub Pages.

## Features

- 📝 **Content Management**: Sync content from GitHub Issues automatically
- 🎨 **Modern Design**: Built with Tailwind CSS for a clean, academic look
- 📱 **Responsive**: Mobile-first design that works on all devices
- 🔍 **SEO Optimized**: Schema.org markup, OpenGraph, Twitter Cards, and sitemap
- 🏷️ **Tag Filtering**: Client-side filtering and search for publications, talks, and resources
- ♿ **Accessible**: Following WCAG guidelines for accessibility

## Quick Start

### Prerequisites

- Ruby 3.2+ (for Jekyll)
- Node.js 20+ (for Tailwind CSS)
- Bundler (`gem install bundler`)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/jukomol/site.git
cd site
```

2. Install Ruby dependencies:
```bash
bundle config set --local path 'vendor/bundle'
bundle install
```

3. Install Node dependencies:
```bash
npm install
```

4. Build Tailwind CSS:
```bash
npm run build:css
```

5. Serve the site locally:
```bash
bundle exec jekyll serve
```

6. Open your browser to `http://localhost:4000`

## Content Management

This site uses GitHub Issues as a CMS. Content is automatically synced using the `scripts/sync_issues.mjs` script.

### Issue Labels

Use these labels on your GitHub Issues to categorize content:

- `bio` - Personal bio and profile information (updates `_data/bio.yml`)
- `cv` - CV download link (updates `_data/bio.yml`)
- `post` - Blog posts (creates files in `_posts/`)
- `pub` - Publications (creates files in `_pubs/`)
- `presentation` - Talks and presentations (creates files in `_talks/`)
- `resource` - Resources like datasets, code, etc. (creates files in `_resources/`)
- `contact` - Contact information (updates `_data/contact.yml`)

### Issue Format

Each issue should have YAML front matter at the top, followed by the content:

```markdown
---
title: "My Publication Title"
authors:
  - "Author Name"
venue: "Conference Name"
date: 2024-01-15
tags:
  - "Machine Learning"
  - "NLP"
---

# Content

Your markdown content goes here.
```

### Front Matter Fields

#### Publications (`pub`)
```yaml
title: "Publication Title"
authors:
  - "Author 1"
  - "Author 2"
venue: "Conference or Journal Name"
date: 2024-01-15
abstract: "Brief abstract"
pdf: "https://link-to-pdf.com"
doi: "10.1234/example"
code: "https://github.com/user/repo"
arxiv: "2401.12345"
tags:
  - "Tag 1"
  - "Tag 2"
```

#### Presentations (`presentation`)
```yaml
title: "Talk Title"
event: "Conference Name"
location: "City, Country"
date: 2024-01-15
slides: "https://link-to-slides.com"
video: "https://youtube.com/watch?v=..."
tags:
  - "Tag 1"
```

#### Resources (`resource`)
```yaml
title: "Resource Title"
resource_type: "Dataset" # or "Software", "Tutorial", etc.
date: 2024-01-15
link: "https://link-to-resource.com"
description: "Brief description"
tags:
  - "Tag 1"
```

#### Blog Posts (`post`)
```yaml
title: "Post Title"
date: 2024-01-15
author: "Author Name"
tags:
  - "Tag 1"
```

### Complete Issue Examples

Below are complete examples of how to create GitHub Issues for each content type. Simply create a new issue, add the appropriate label, and paste the example content (modified with your information).

#### Example 1: Creating a Blog Post

**Issue Title:** Getting Started with Machine Learning

**Label:** `post`

**Issue Body:**
```markdown
---
title: "Getting Started with Machine Learning"
date: 2024-01-15
author: "Jahir Uddin"
tags:
  - "Machine Learning"
  - "Tutorial"
  - "Beginner"
---

# Introduction

This post provides a comprehensive guide for beginners starting their journey in machine learning.

## Key Concepts

1. **Supervised Learning**: Learning from labeled data
2. **Unsupervised Learning**: Finding patterns in unlabeled data
3. **Deep Learning**: Neural networks with multiple layers

## Resources

- [Coursera ML Course](https://coursera.org/ml)
- [Fast.ai](https://fast.ai)
- [Scikit-learn Documentation](https://scikit-learn.org)

## Conclusion

Machine learning is an exciting field with endless possibilities!
```

#### Example 2: Adding a Publication

**Issue Title:** Deep Learning for Agricultural Robotics

**Label:** `pub`

**Issue Body:**
```markdown
---
title: "Deep Learning Approaches for Precision Agriculture"
authors:
  - "Jahir Uddin"
  - "Jane Smith"
  - "John Doe"
venue: "International Conference on Robotics and Automation (ICRA 2024)"
date: 2024-05-20
abstract: "This paper presents novel deep learning approaches for autonomous agricultural robots to improve crop yield monitoring and disease detection."
pdf: "https://example.com/paper.pdf"
doi: "10.1109/ICRA.2024.1234"
code: "https://github.com/username/ag-robotics"
arxiv: "2401.12345"
tags:
  - "Deep Learning"
  - "Robotics"
  - "Agriculture"
  - "Computer Vision"
---

# Deep Learning Approaches for Precision Agriculture

## Abstract

Traditional agricultural practices are being transformed by autonomous systems...

## Introduction

The integration of robotics and artificial intelligence in agriculture...

## Methodology

We propose a multi-stage pipeline for crop monitoring...

## Results

Our approach achieves 95% accuracy in disease detection...

## Conclusion

This work demonstrates the potential of AI-driven agricultural systems...
```

#### Example 3: Adding a Presentation

**Issue Title:** AI in Healthcare - Conference Talk

**Label:** `presentation`

**Issue Body:**
```markdown
---
title: "Artificial Intelligence Applications in Modern Healthcare"
event: "Healthcare Innovation Summit 2024"
location: "Boston, MA"
date: 2024-03-15
slides: "https://example.com/slides.pdf"
video: "https://youtube.com/watch?v=example123"
tags:
  - "AI"
  - "Healthcare"
  - "Medical Imaging"
  - "Invited Talk"
---

# Talk Abstract

An overview of how artificial intelligence is revolutionizing healthcare, from diagnosis to treatment planning and patient care optimization.

## Key Topics Covered

- Medical image analysis using deep learning
- Predictive analytics for patient outcomes
- AI-assisted surgical planning
- Ethical considerations in healthcare AI

## Audience

Healthcare professionals, researchers, and technology developers interested in the intersection of AI and medicine.
```

#### Example 4: Adding a Resource

**Issue Title:** Healthcare NLP Dataset

**Label:** `resource`

**Issue Body:**
```markdown
---
title: "Medical Text Classification Dataset"
resource_type: "Dataset"
date: 2024-01-10
link: "https://github.com/username/medical-nlp-dataset"
description: "A curated dataset of 50,000 labeled medical texts for classification tasks including diagnosis prediction and symptom extraction."
tags:
  - "Dataset"
  - "Healthcare"
  - "NLP"
  - "Medical Informatics"
---

# Medical Text Classification Dataset

## Overview

This dataset contains 50,000 medical texts collected from clinical notes and medical literature, annotated for various classification tasks.

## Dataset Statistics

- **Total Samples**: 50,000
- **Categories**: 15 disease categories
- **Format**: JSON and CSV
- **License**: CC BY 4.0

## Use Cases

- Disease classification
- Symptom extraction
- Medical entity recognition
- Clinical decision support systems

## Citation

If you use this dataset, please cite:
```
@dataset{medical_nlp_2024,
  title={Medical Text Classification Dataset},
  author={Uddin, Jahir},
  year={2024}
}
```

## Download

Available on [GitHub](https://github.com/username/medical-nlp-dataset)
```

#### Example 5: Updating Bio Information

**Issue Title:** Bio Update

**Label:** `bio`

**Issue Body:**
```markdown
---
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
links:
  github: "jukomol"
  scholar: "https://scholar.google.com/citations?user=example"
  orcid: "0000-0000-0000-0000"
---

Additional biographical information can be added here if needed.
```

#### Example 6: Adding CV Download Link

**Issue Title:** CV Download Link

**Label:** `cv`

**Issue Body:**
```markdown
---
download_cv: "/assets/cv/Jahir_Uddin_CV.pdf"
---

This issue adds or updates the CV download link in the bio data.
```

#### Example 7: Updating Contact Information

**Issue Title:** Contact Info Update

**Label:** `contact`

**Issue Body:**
```markdown
---
email: "juddin@unmc.edu"
office: "Room 301, Research Building"
office_hours: "Tuesday and Thursday, 2-4 PM"
social:
  twitter: ""
  github: "https://github.com/jukomol"
  linkedin: "https://linkedin.com/in/jahiruddin"
  scholar: "https://scholar.google.com/citations?user=example"
---

Feel free to reach out via email or stop by during office hours!
```

### How to Create an Issue

1. Go to your repository's **Issues** tab
2. Click **New Issue**
3. Enter the issue title
4. Paste the example content (modified with your information) into the issue body
5. Add the appropriate label (`post`, `pub`, `presentation`, `resource`, `bio`, `cv`, or `contact`)
6. Click **Submit new issue**

The GitHub Actions workflow will automatically:
- Detect the new issue
- Parse the YAML front matter
- Create/update the appropriate files
- Commit and push the changes
- Trigger a site rebuild and deployment

**Note:** Make sure the YAML front matter is properly formatted with `---` delimiters at the start and end.

#### Bio (`bio`)
```yaml
name: "Your Name"
title: "Your Title"
affiliation: "Your Institution"
email: "your.email@example.com"
bio_short: "One sentence bio"
bio_full: |
  Full biography with multiple paragraphs
research_interests:
  - "Interest 1"
  - "Interest 2"
education:
  - degree: "Ph.D. in Computer Science"
    institution: "University Name"
    year: "2020"
experience:
  - position: "Position Title"
    organization: "Organization"
    period: "2020 - Present"
    description: "Description"
profile_image: "/assets/images/profile.jpg"
links:
  github: "username"
  scholar: "https://scholar.google.com/..."
  orcid: "0000-0000-0000-0000"
```

#### Contact (`contact`)
```yaml
email: "your.email@example.com"
office: "Room 404, Computer Science Building"
office_hours: "Monday and Wednesday, 2-4 PM"
social:
  twitter: "https://twitter.com/username"
  github: "https://github.com/username"
  linkedin: "https://linkedin.com/in/username"
  scholar: "https://scholar.google.com/citations?user=..."
```

## Running the Sync Script

### Locally (for testing)

The sync script includes mock data for testing without API access:

```bash
npm run sync
```

### With GitHub API

Set the `GITHUB_TOKEN` environment variable:

```bash
export GITHUB_TOKEN=your_github_token
npm run sync
```

## GitHub Actions Workflows

### Sync Workflow (`.github/workflows/sync.yml`)

Automatically runs when:
- An issue is created, edited, or labeled
- Daily at 2 AM UTC (via cron)
- Manually triggered

### Build and Deploy Workflow (`.github/workflows/build.yml`)

Runs on every push to `main` and:
1. Builds Tailwind CSS
2. Builds Jekyll site
3. Deploys to GitHub Pages

## Customization

### Site Configuration

Edit `_data/site.yml` to customize:
- Site name and tagline
- Navigation menu
- Social links
- Theme colors
- SEO defaults

### Styling

The site uses Tailwind CSS. Customize the design in:
- `tailwind.config.js` - Theme colors, fonts, and other Tailwind settings
- `assets/css/tailwind.css` - Custom CSS classes and component styles

### Layouts

Layouts are in the `_layouts/` directory:
- `default.html` - Base layout with header and footer
- `home.html` - Home page layout
- `post.html` - Blog post layout
- `pub.html` - Publication layout
- `talk.html` - Presentation layout
- `resource.html` - Resource layout

### Includes

Reusable components in `_includes/`:
- `head.html` - SEO tags, meta tags, stylesheets
- `header.html` - Site navigation
- `footer.html` - Site footer
- `card.html` - Card component for lists

## SEO and Analytics

### SEO Features

- ✅ Semantic HTML
- ✅ Schema.org markup (Person, BlogPosting, ScholarlyArticle)
- ✅ OpenGraph tags for social sharing
- ✅ Twitter Cards
- ✅ XML sitemap
- ✅ robots.txt

### Adding Analytics

To add Google Analytics, add this to `_includes/head.html`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## Comments with Giscus

The post layout includes commented-out code for [Giscus](https://giscus.app/) comments.

To enable:
1. Enable Discussions in your repository settings
2. Visit https://giscus.app/
3. Configure your preferences and get the script tag
4. Uncomment and update the Giscus section in `_layouts/post.html`

## Deployment

### GitHub Pages

**Important:** This site uses Jekyll 4.x and **requires GitHub Actions for deployment**. Classic GitHub Pages deployment only supports Jekyll 3.9.x.

#### Setup Instructions

1. Go to your repository **Settings → Pages**
2. Under "Build and deployment", set **Source** to **"GitHub Actions"** (not "Deploy from a branch")
3. Push to the `main` branch
4. The site will be built and deployed automatically via the workflow in `.github/workflows/build.yml`

#### Troubleshooting

If you see an error like "The github-pages gem can't satisfy your Gemfile's dependencies":
- This means Pages is configured to use "Deploy from a branch" instead of "GitHub Actions"
- Go to Settings → Pages and change the Source to "GitHub Actions"
- The error will be resolved once the correct deployment method is configured

### Custom Domain

To use a custom domain:
1. Add a `CNAME` file to the root with your domain
2. Configure DNS settings with your domain provider
3. Update `url` in `_config.yml`

## Development

### Watch Mode

For development with auto-reload:

```bash
# Terminal 1: Watch and rebuild CSS
npm run watch:css

# Terminal 2: Serve Jekyll with live reload
bundle exec jekyll serve --livereload
```

### Build for Production

```bash
npm run build:css
bundle exec jekyll build
```

## Project Structure

```
.
├── _config.yml              # Jekyll configuration
├── _data/                   # Data files
│   ├── bio.yml             # Bio and CV info
│   ├── contact.yml         # Contact information
│   └── site.yml            # Site configuration
├── _includes/              # Reusable components
│   ├── card.html
│   ├── footer.html
│   ├── head.html
│   └── header.html
├── _layouts/               # Page layouts
│   ├── default.html
│   ├── home.html
│   ├── post.html
│   ├── pub.html
│   ├── resource.html
│   └── talk.html
├── _posts/                 # Blog posts
├── _pubs/                  # Publications
├── _resources/             # Resources
├── _talks/                 # Presentations
├── assets/
│   ├── css/
│   │   ├── tailwind.css   # Tailwind input
│   │   └── site.css       # Generated CSS (gitignored)
│   └── js/
│       └── filter.js      # Client-side filtering
├── pages/                  # Static pages
│   ├── contact.md
│   ├── cv.md
│   ├── presentations.md
│   ├── publications.md
│   └── resources.md
├── scripts/
│   └── sync_issues.mjs
├── .github/workflows/
│   ├── build.yml
│   └── sync.yml
├── index.md                # Home page
├── robots.txt
├── Gemfile
├── package.json
└── tailwind.config.js
```

## Troubleshooting

### Jekyll build fails

- Make sure you've installed all dependencies: `bundle install`
- Clear the cache: `bundle exec jekyll clean`
- Check for syntax errors in markdown files

### CSS not updating

- Rebuild Tailwind: `npm run build:css`
- Clear Jekyll cache: `bundle exec jekyll clean`
- Make sure `assets/css/site.css` is being generated

### Sync script not working

- Check that `GITHUB_TOKEN` is set
- Verify issue labels are correct
- Check YAML front matter syntax in issues

## License

MIT License - feel free to use this template for your own academic website.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

If you encounter any issues or have questions, please [open an issue](https://github.com/jukomol/site/issues).