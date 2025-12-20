const fs = require('fs');
const path = require('path');

const projectsDir = path.join(__dirname, 'projects');
const imagesDir = path.join(__dirname, 'images');

// Define keywords for each project to match images
// This is a manual mapping to ensure high quality matches
const projectKeywords = {
    'maacm-stair.html': ['maacm', 'stair'],
    'baystate-column.html': ['baystate', 'column'],
    'abu-dhabi-column.html': ['abu-dhabi', 'column'],
    'maacm-theater.html': ['maacm-theater', 'theater'],
    'oculus.html': ['oculus'],
    'vikings.html': ['vikings'],
    'walker.html': ['walker'],
    'seeyond.html': ['seeyond'],
    'mall-of-america.html': ['mall-of-america'],
    'orbicles.html': ['orbicles', 'bird'],
    'ovoid.html': ['ovoid'],
    'pmc.html': ['pmc'],
    'sirius-xm.html': ['sirius'],
    'snc.html': ['snc'],
    'visa.html': ['visa'],
    'vks-ice.html': ['vks-ice', 'vksice'],
    'neocon.html': ['neocon'],
    'osage.html': ['osage'],
    'neu.html': ['neu'],
    'rainbow-ceiling.html': ['rainbow'],
    'mercy.html': ['mercy'],
    'atrium-stair.html': ['atrium'],
    'hyatt.html': ['hyatt'],
    'enscape-stair.html': ['enscape'],
    'lax.html': ['lax', 'esavvy'],
    'mobile-walls.html': ['mobile-walls'],
    'minn-lab.html': ['minn-lab', 'bird-house'],
    'studio-theatre.html': ['studio-theatre'],
    'rocketfuel.html': ['rocketfuel']
};

const images = fs.readdirSync(imagesDir);

// Helper to check if an image matches project keywords
function getImageMatches(filename, keywords) {
    if (!keywords) return false;
    const lowerName = filename.toLowerCase();
    // Match if ANY keyword is present
    return keywords.some(keyword => lowerName.includes(keyword));
}

const projectFiles = fs.readdirSync(projectsDir);

projectFiles.forEach(file => {
    if (file === 'template.html') return;

    const filePath = path.join(projectsDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    const keywords = projectKeywords[file];
    if (!keywords) {
        console.log(`Skipping ${file}: No keywords defined.`);
        return;
    }

    const matchingImages = images.filter(img => getImageMatches(img, keywords));

    if (matchingImages.length === 0) {
        console.log(`No additional images found for ${file}`);
        return;
    }

    console.log(`Found ${matchingImages.length} images for ${file}`);

    // Generate HTML for gallery
    let galleryHtml = '';
    matchingImages.forEach(img => {
        // Avoid adding the main image again if possible (simple check)
        if (content.includes(img)) return;

        galleryHtml += `            <img src="../images/${img}" alt="${img}" class="detail-image">\n`;
    });

    if (galleryHtml) {
        // Insert into the project-gallery div
        // We look for the closing of the first img tag or the div
        // Easier: just append to the end of the .project-gallery div
        content = content.replace('</div>', `${galleryHtml}        </div>`);

        // Only do the first matching div (which is project-gallery)
        // Regex replacement would be safer to target specific div
        // Let's use a more specific replace string
        content = content.replace(
            /(<div class="project-gallery">[\s\S]*?)(<\/div>)/,
            `$1${galleryHtml}        $2`
        );

        fs.writeFileSync(filePath, content);
        console.log(`Updated ${file}`);
    }
});
