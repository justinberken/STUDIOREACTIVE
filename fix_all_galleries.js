const fs = require('fs');
const path = require('path');

const projectsDir = path.join(__dirname, 'projects');
const imagesDir = path.join(__dirname, 'images');

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

const allImages = fs.readdirSync(imagesDir);

// Helper to get matching images from valid list
function getMatchingImages(keywords) {
    if (!keywords) return [];
    return allImages.filter(img => keywords.some(k => img.toLowerCase().includes(k)));
}

const files = fs.readdirSync(projectsDir);

files.forEach(file => {
    if (!file.endsWith('.html') || file === 'template.html') return;

    const filePath = path.join(projectsDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // 1. Find existing images in the file (to preserve order if possible, or just gather them)
    // Actually, best to rebuild the gallery from scratch to ensure cleanliness and no dupes.

    // Get keywords
    const keywords = projectKeywords[file];
    const relatedImages = getMatchingImages(keywords);

    // Also grab any images currently linked in the file (in case we missed some by keywords but they were manually added)
    const currentImgRegex = /<img src="\.\.\/images\/([^"]+)"/g;
    let match;
    const currentImages = [];
    while ((match = currentImgRegex.exec(content)) !== null) {
        currentImages.push(match[1]);
    }

    // Merge lists
    const mergedImages = [...new Set([...currentImages, ...relatedImages])];

    // Filter to ensure they exist on disk
    const validImages = mergedImages.filter(img => {
        const exists = fs.existsSync(path.join(imagesDir, img));
        if (!exists) console.log(`Warning: ${img} referenced in ${file} does not exist.`);
        return exists;
    });

    if (validImages.length === 0) {
        console.log(`No images for ${file}`);
        return;
    }

    // Generate new gallery
    const galleryHtml =
        `        <div class="project-gallery">
${validImages.map(img => `            <img src="../images/${img}" alt="${img}" class="detail-image">`).join('\n')}
        </div>`;

    // Replace the old gallery
    // We look for the div with class project-gallery and replace it entirely
    const galleryRegex = /<div class="project-gallery">[\s\S]*?<\/div>/;

    if (galleryRegex.test(content)) {
        content = content.replace(galleryRegex, galleryHtml);
        fs.writeFileSync(filePath, content);
        console.log(`Fixed ${file}: ${validImages.length} images.`);
    } else {
        console.log(`Could not find gallery div in ${file}`);
    }
});
