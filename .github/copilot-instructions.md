# JU KOMOL Personal Portfolio Website

JU KOMOL's personal portfolio website is a static HTML/CSS/JavaScript website hosted on GitHub Pages. The site features a homepage, portfolio/about page, blog with filtering, logs, and resources sections.

**Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.**

## Working Effectively

### Bootstrap and Test the Repository
- No build process required - this is a pure static website
- Clone and serve immediately:
  - `cd /path/to/jukomol.github.io`
  - `python3 -m http.server 8000` -- starts immediately, NEVER CANCEL
  - Navigate to `http://localhost:8000` to view the website

### Local Development Server
- **ALWAYS** use Python's built-in HTTP server for local development:
  - `python3 -m http.server 8000` (serves on http://localhost:8000)
  - `python3 -m http.server 3000` (serves on http://localhost:3000) 
  - Server starts instantly (< 1 second)
  - Page load time: < 0.002 seconds
- **Alternative servers** (if Python unavailable):
  - `npx serve .` (requires Node.js)
  - `php -S localhost:8000` (requires PHP)

### No Dependencies or Build Steps
- **CRITICAL**: This repository has NO package.json, NO node_modules, NO build process
- Do NOT attempt to run `npm install`, `npm run build`, or any build commands
- All CSS and JavaScript files are already minified and production-ready
- All assets are self-contained in the repository

## Validation

### Manual Testing Scenarios
After making any changes, **ALWAYS** run through these validation steps:

1. **Start local server and test core functionality**:
   - `python3 -m http.server 8000`
   - Navigate to `http://localhost:8000`
   - Verify homepage loads with quote rotation
   - Test all navigation links work (Home, About Me, Blog, Logs, Resources, GitHub)

2. **Test key pages**:
   - **Homepage** (`/`): Check quote rotation, buttons work, responsive design
   - **About Me** (`/html/portfolio.html`): Verify image loads, links work, resume download functions
   - **Blog** (`/html/myblog.html`): Test tag filtering buttons, blog post links
   - **Logs** (`/html/logs.html`): Verify content displays correctly
   - **Resources** (`/html/material.html`): Check resource links

3. **Cross-browser testing**:
   - Test in multiple browsers when possible
   - Verify mobile responsiveness (website uses Bootstrap)
   - Check that external links (social media, GitHub) open correctly

4. **Asset validation**:
   - Verify all images load properly (check browser dev tools for 404s)
   - Confirm CSS styling applies correctly
   - Test JavaScript functionality (quote rotation, button clicks)

### Performance Expectations
- **Server startup**: < 1 second
- **Page load time**: < 0.002 seconds
- **Total asset size**: ~10MB (mostly images)
- **No timeouts needed**: All operations are instant

## GitHub Pages Deployment

### Automatic Deployment
- **CRITICAL**: GitHub Pages automatically deploys from the `main` branch
- Changes pushed to `main` are live within 1-2 minutes
- **Custom domain**: jukomol.optisense.tech (configured via CNAME file)
- **NO CI/CD pipeline required** - GitHub Pages serves static files directly

### Manual Deployment Testing
- Test locally before pushing to main
- Push to feature branch first for review if making significant changes
- **NEVER** push broken code directly to main branch

## Common Tasks

### File Structure Reference
```
/home/runner/work/jukomol.github.io/jukomol.github.io/
├── index.html                 # Main homepage
├── CNAME                      # Custom domain configuration  
├── bookstyle.css             # Legacy CSS (not used)
├── debug.log                 # Browser crash logs (ignore)
├── css/                      # Stylesheets directory
│   ├── bootstrap.min.css     # Bootstrap framework
│   ├── mine.css              # Main custom styles
│   ├── myblogstyle.css       # Blog page styles
│   ├── font-awesome.min.css  # Icon fonts
│   └── [other CSS files]
├── html/                     # Interior pages
│   ├── portfolio.html        # About/portfolio page
│   ├── myblog.html           # Blog with filtering
│   ├── logs.html             # Personal logs
│   ├── material.html         # Resources page
│   └── [other pages]
├── js/                       # JavaScript files
│   ├── jquery.min.js         # jQuery library
│   ├── ju.js                 # Main site JavaScript
│   └── blog.js               # Blog filtering logic
├── img/                      # Images (8.9MB total)
├── fonts/                    # Web fonts (904KB)
└── files/                    # Downloadable files (PDF resume)
```

### Key Navigation Pages
- **Homepage**: `/index.html` - Quote rotation, main navigation buttons
- **About Me**: `/html/portfolio.html` - Personal bio, resume download, research interests  
- **Blog**: `/html/myblog.html` - Blog posts with tag filtering (CCTV, Linux, Python, Personal)
- **Logs**: `/html/logs.html` - Personal development logs
- **Resources**: `/html/material.html` - Useful resources and links

### Making Content Changes
- **Update quotes**: Edit the `quotes` array in `index.html` (lines 101-122)
- **Add blog posts**: Add new post card in `myblog.html` and create corresponding HTML file
- **Update portfolio**: Modify `/html/portfolio.html` for bio/experience changes
- **Add resources**: Update `/html/material.html` with new links
- **Replace resume**: Update `/files/Jahir_Uddin_resume.pdf`

### CSS/Styling Changes
- **Main styles**: `/css/mine.css` - primary custom styles
- **Blog styles**: `/css/myblogstyle.css` - blog-specific styling
- **Bootstrap**: `/css/bootstrap.min.css` - framework (avoid modifying)
- **Icons**: `/css/font-awesome.min.css` - icon fonts

### JavaScript Functionality
- **Quote rotation**: Implemented in `index.html` (lines 101-139)
- **Site interactions**: `/js/ju.js` - main site JavaScript
- **Blog filtering**: `/js/blog.js` - tag filtering for blog posts
- **jQuery**: `/js/jquery.min.js` - dependency (avoid updating)

## Troubleshooting

### Common Issues
1. **Server won't start**: 
   - Check if port 8000 is available: `lsof -i :8000`
   - Try different port: `python3 -m http.server 3000`

2. **Pages not loading**:
   - Verify you're in the repository root directory
   - Check file permissions: `ls -la *.html`

3. **Images not displaying**:
   - Check image paths in HTML (should start with `/img/`)
   - Verify images exist: `ls -la img/`

4. **CSS not applied**:
   - Check CSS paths in HTML files
   - Verify CSS files exist: `ls -la css/`

5. **JavaScript errors**:
   - Open browser dev tools to check console for errors
   - Common issue: missing video element causes error (ignore - non-blocking)

### Expected Warnings/Errors (Safe to Ignore)
- Google Fonts blocked: `net::ERR_BLOCKED_BY_CLIENT` 
- Video element errors: `Cannot set properties of null (setting 'onloadeddata')`
- Theme toggle errors: Element may not exist on all pages

## Performance Guidelines

### Optimization Best Practices
- **Images**: Already optimized, but compress new images before adding
- **CSS/JS**: Files are already minified, avoid unminifying
- **Fonts**: FontAwesome and Google Fonts are cached, prefer existing icons

### Asset Size Limits
- Keep new images under 500KB when possible
- Total repository size should stay under 25MB (currently ~10MB)
- Optimize images with tools like `imageoptim` or online compressors

## Security Considerations

### Safe Practices
- All external links open in same tab (consider adding `target="_blank"` for external links)
- No user input forms - static site is inherently secure
- External dependencies (Google Fonts, social links) are minimal
- Resume PDF should be updated regularly but check file size

### Content Guidelines  
- Keep personal information appropriate for public viewing
- Social media links are public - verify they're current
- Blog content is publicly accessible via GitHub Pages

---

**Last Updated**: Generated automatically - Always verify commands work in your specific environment before documenting them as reliable.