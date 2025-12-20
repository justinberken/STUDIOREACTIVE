const fs = require('fs');
const path = require('path');

const projectsDir = path.join(__dirname, 'projects');
const imagesDir = path.join(__dirname, 'images');

// Comprehensive keyword mapping for each project to find ALL related images
// Keywords are matched against lowercase image filenames
const projectKeywords = {
    'maacm-stair.html': {
        keywords: ['maacm-stair', 'maacm stair'],
        exclude: ['theater', 'theatre', 'atrium', 'shops']
    },
    'maacm-theater.html': {
        keywords: ['maacm-theater', 'maacm theater', 'maacm theatre'],
        exclude: ['stair', 'shops']
    },
    'baystate-column.html': {
        keywords: ['baystate'],
        exclude: []
    },
    'abu-dhabi-column.html': {
        keywords: ['abu-dhabi', 'adha'],
        exclude: []
    },
    'oculus.html': {
        keywords: ['oculus'],
        exclude: []
    },
    'vikings.html': {
        keywords: ['viking'],
        exclude: []
    },
    'walker.html': {
        keywords: ['walker'],
        exclude: []
    },
    'seeyond.html': {
        keywords: ['seeyond', 'cellular'],
        exclude: ['mobile', 'illuminated', 'lax', 'esavvy']
    },
    'mall-of-america.html': {
        keywords: ['mall-of-america'],
        exclude: []
    },
    'orbicles.html': {
        keywords: ['orbicle', 'orbacle'],
        exclude: []
    },
    'ovoid.html': {
        keywords: ['ovoid'],
        exclude: []
    },
    'pmc.html': {
        keywords: ['pmc-screenshot', 'pmc screenshot'],
        exclude: []
    },
    'sirius-xm.html': {
        keywords: ['sirius'],
        exclude: []
    },
    'snc.html': {
        keywords: ['snc'],
        exclude: []
    },
    'visa.html': {
        keywords: ['visa'],
        exclude: []
    },
    'vks-ice.html': {
        keywords: ['vks', 'vksice'],
        exclude: []
    },
    'neocon.html': {
        keywords: ['neocon'],
        exclude: []
    },
    'osage.html': {
        keywords: ['osage'],
        exclude: []
    },
    'neu.html': {
        keywords: ['neu-'],
        exclude: []
    },
    'rainbow-ceiling.html': {
        keywords: ['rainbow'],
        exclude: []
    },
    'mercy.html': {
        keywords: ['mercy'],
        exclude: []
    },
    'atrium-stair.html': {
        keywords: ['atrium-stair', 'atrium stair', 'dannys'],
        exclude: []
    },
    'hyatt.html': {
        keywords: ['hyatt'],
        exclude: []
    },
    'enscape-stair.html': {
        keywords: ['enscape-stair', 'enscape stair'],
        exclude: []
    },
    'lax.html': {
        keywords: ['lax', 'esavvy'],
        exclude: []
    },
    'mobile-walls.html': {
        keywords: ['mobile-wall', 'mobile wall', 'illuminated'],
        exclude: []
    },
    'minn-lab.html': {
        keywords: ['minn-lab', 'bird-house', 'bird house'],
        exclude: []
    },
    'studio-theatre.html': {
        keywords: ['studio-theatre', 'studio theatre', 'nu-studio'],
        exclude: []
    },
    'rocketfuel.html': {
        keywords: ['rocketfuel'],
        exclude: []
    }
};

// Get list of all images, filtering out duplicates and non-image files
const allImages = fs.readdirSync(imagesDir).filter(img => {
    const ext = path.extname(img).toLowerCase();
    const isImage = ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
    // Skip files with UUID-like patterns (duplicates) - match pattern like -abc123def45678
    const isDuplicate = /-[a-f0-9]{8}[a-f0-9-]+\.(jpg|jpeg|png|webp|gif)$/i.test(img);
    return isImage && !isDuplicate;
});

console.log(`Found ${allImages.length} unique images (excludes duplicates with UUIDs)`);

// Helper to check if an image matches project keywords
function matchesProject(filename, config) {
    const lowerName = filename.toLowerCase();

    // Check exclusions first
    if (config.exclude && config.exclude.some(ex => lowerName.includes(ex))) {
        return false;
    }

    // Check if any keyword matches
    return config.keywords.some(keyword => lowerName.includes(keyword.toLowerCase()));
}

// Process each project file
const projectFiles = fs.readdirSync(projectsDir).filter(f => f.endsWith('.html') && f !== 'template.html');

let totalUpdated = 0;

projectFiles.forEach(file => {
    const config = projectKeywords[file];
    if (!config) {
        console.log(`⚠ Skipping ${file}: No keywords defined`);
        return;
    }

    // Find matching images
    const matchingImages = allImages.filter(img => matchesProject(img, config));

    if (matchingImages.length === 0) {
        console.log(`⚠ No images found for ${file}`);
        return;
    }

    console.log(`\n📁 ${file}: Found ${matchingImages.length} images`);
    matchingImages.forEach(img => console.log(`   - ${img}`));

    // Read current HTML file
    const filePath = path.join(projectsDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Extract the project title from the page
    const titleMatch = content.match(/<h1 class="project-detail-title">([^<]+)<\/h1>/);
    const projectTitle = titleMatch ? titleMatch[1] : file.replace('.html', '');

    // Generate new gallery HTML with all images
    let galleryHtml = '        <div class="project-gallery">\n';
    matchingImages.forEach(img => {
        galleryHtml += `            <img src="../images/${img}" alt="${projectTitle}" class="detail-image">\n`;
    });
    galleryHtml += '        </div>';

    // Replace the existing project-gallery div
    const galleryRegex = /<div class="project-gallery">[\s\S]*?<\/div>/;

    if (galleryRegex.test(content)) {
        content = content.replace(galleryRegex, galleryHtml);
        fs.writeFileSync(filePath, content);
        console.log(`✅ Updated ${file} with ${matchingImages.length} images`);
        totalUpdated++;
    } else {
        console.log(`❌ Could not find gallery div in ${file}`);
    }
});

console.log(`\n========================================`);
console.log(`Total projects updated: ${totalUpdated}`);
console.log(`========================================`);
