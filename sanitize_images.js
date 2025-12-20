const fs = require('fs');
const path = require('path');

const sourceDir = 'REF IMAGES';
const targetDir = 'images';

// Create target directory if it doesn't exist
if (!fs.existsSync(targetDir)){
    fs.mkdirSync(targetDir);
}

// Function to sanitize filename
function sanitizeFilename(filename) {
    const ext = path.extname(filename);
    const name = path.basename(filename, ext);
    
    // Replace spaces and special chars with hyphens, remove parens, lowercase
    let newName = name.toLowerCase()
        .replace(/\s+/g, '-')       // Replace spaces with -
        .replace(/[()]/g, '')       // Remove parens
        .replace(/[^a-z0-9\-]/g, '') // Remove other special chars
        .replace(/-+/g, '-');       // Collapse multiple hyphens
        
    // Trim leading/trailing hyphens
    newName = newName.replace(/^-+|-+$/g, '');
    
    return newName + ext.toLowerCase();
}

const files = fs.readdirSync(sourceDir);
const mapping = {};

console.log(`Processing ${files.length} files...`);

files.forEach(file => {
    const sourcePath = path.join(sourceDir, file);
    // Skip directories
    if (fs.lstatSync(sourcePath).isDirectory()) return;

    const newName = sanitizeFilename(file);
    const targetPath = path.join(targetDir, newName);

    // Copy file instead of moving to preserve original
    fs.copyFileSync(sourcePath, targetPath);
    
    mapping[file] = newName;
    console.log(`Mapped: "${file}" -> "${newName}"`);
});

// Write mapping to file for reference
fs.writeFileSync('image_mapping.json', JSON.stringify(mapping, null, 2));
console.log('Done. Mapping saved to image_mapping.json');
