const fs = require('fs');
const path = require('path');
// No external dependencies needed

const indexHtmlPath = path.join(__dirname, 'index.html');
const templatePath = path.join(__dirname, 'projects', 'template.html');
const outputDir = path.join(__dirname, 'projects');

const indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');
const templateHtml = fs.readFileSync(templatePath, 'utf8');

// Regex to find project cards
// Pattern: <a href="projects/(.+?)".*?<img src="(.+?)".*?<h2.*?>(.+?)</h2>
const projectRegex = /<a href="projects\/([^"]+)".*?<img src="([^"]+)".*?<h2 class="project-title">([^<]+)<\/h2>/gs;

let match;
let count = 0;

while ((match = projectRegex.exec(indexHtml)) !== null) {
    const filename = match[1];
    const imagePathRelativeToIndex = match[2]; // e.g., "images/maacm-stair.jpg"
    const title = match[3];

    // Corrections for project page
    // Image path in project page needs to go up one level: "../images/..."
    const imagePath = '../' + imagePathRelativeToIndex;

    // Fill template
    let pageContent = templateHtml
        .replace(/PROJECT NAME/g, title) // Title tag
        .replace(/Project Name/g, title) // H1
        .replace(/Description placeholder./g, `Details for the ${title} project coming soon.`)
        .replace(/src="\.\.\/REF IMAGES\/placeholder\.jpg"/g, `src="${imagePath}"`) // Replace placeholder image
        .replace(/alt="Project Image"/g, `alt="${title}"`);

    const outputPath = path.join(outputDir, filename);
    fs.writeFileSync(outputPath, pageContent);
    console.log(`Generated: ${filename}`);
    count++;
}

console.log(`Successfully generated ${count} project pages.`);
