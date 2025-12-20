const fs = require('fs');
const path = require('path');

const projectPath = path.join(__dirname, 'projects', 'maacm-stair.html');
const imagesDir = path.join(__dirname, 'images');

if (!fs.existsSync(projectPath)) {
    console.log('Project file not found');
    process.exit(1);
}

let content = fs.readFileSync(projectPath, 'utf8');

// Extract all image sources
const regex = /<img src="\.\.\/images\/([^"]+)"/g;
let match;
const images = [];
while ((match = regex.exec(content)) !== null) {
    images.push(match[1]);
}

console.log(`Found ${images.length} image references in HTML.`);

images.forEach(img => {
    const imgPath = path.join(imagesDir, img);
    if (fs.existsSync(imgPath)) {
        console.log(`[OK] ${img}`);
    } else {
        console.log(`[MISSING] ${img}`);
    }
});

// Remove duplicates
// We'll read the file, identify the distinct images, and rewrite the gallery section.
// This is a rough fix for the duplication issue.

const uniqueImages = [...new Set(images)];
if (uniqueImages.length !== images.length) {
    console.log(`Found duplicates! Unique: ${uniqueImages.length}, Total: ${images.length}`);

    // Construct new gallery HTML
    let galleryHtml = '        <div class="project-gallery">\n';
    uniqueImages.forEach(img => {
        galleryHtml += `            <img src="../images/${img}" alt="${img}" class="detail-image">\n`;
    });
    galleryHtml += '        </div>';

    // Replace the entire gallery div
    const newContent = content.replace(
        /<div class="project-gallery">[\s\S]*?<\/div>/,
        galleryHtml
    );

    fs.writeFileSync(projectPath, newContent);
    console.log('Fixed duplicates in maacm-stair.html');
}
