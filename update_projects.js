// Script to update all project pages with new architecture-focused styling
const fs = require('fs');
const path = require('path');

const projectsDir = path.join(__dirname, 'projects');

// Get all HTML files except template.html
const files = fs.readdirSync(projectsDir)
    .filter(f => f.endsWith('.html') && f !== 'template.html');

files.forEach(file => {
    const filePath = path.join(projectsDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Extract the title from the existing file
    const titleMatch = content.match(/<title>([^|]+)/);
    const projectTitle = titleMatch ? titleMatch[1].trim() : file.replace('.html', '');
    
    // Extract the main image
    const imgMatch = content.match(/src="([^"]+)" alt="([^"]+)" class="detail-image"/);
    const imgSrc = imgMatch ? imgMatch[1] : '../images/placeholder.jpg';
    const imgAlt = imgMatch ? imgMatch[2] : projectTitle;
    
    // Create new content
    const newContent = `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${projectTitle} | Studio Reactive</title>
    <link rel="stylesheet" href="../css/style.css">
</head>

<body>
    <header>
        <a href="../index.html" class="logo">Studio Reactive</a>
        <nav>
            <ul>
                <li><a href="../index.html">Projects</a></li>
                <li><a href="../about.html">Studio</a></li>
                <li><a href="../contact.html">Contact</a></li>
            </ul>
        </nav>
    </header>

    <main class="project-detail">
        <h1 class="project-detail-title">${projectTitle}</h1>

        <div class="project-gallery">
            <img src="${imgSrc}" alt="${imgAlt}" class="detail-image">
        </div>

        <div class="project-description">
            <p>Project details coming soon.</p>
        </div>

        <div class="project-navigation">
            <a href="../index.html">← Back to Projects</a>
        </div>
    </main>

    <footer>
        <p>&copy; 2025 Studio Reactive</p>
    </footer>

    <script>
        const header = document.querySelector('header');
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    </script>
</body>

</html>`;

    fs.writeFileSync(filePath, newContent);
    console.log(`Updated: ${file}`);
});

console.log(`\nUpdated ${files.length} project pages.`);
