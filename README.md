# CV Website

A professional, responsive CV website built with semantic HTML, modern CSS, and vanilla JavaScript.

## Project Structure

```
CV website/
├── index.html          # Main HTML document
├── css/
│   └── styles.css      # Stylesheet with design tokens and components
├── js/
│   └── main.js         # JavaScript for dynamic functionality
└── README.md           # This file
```

## Architecture

### Separation of Concerns

The project follows a clean separation of concerns:

- **HTML** (`index.html`): Semantic markup and document structure
- **CSS** (`css/styles.css`): All styling, including design tokens, base styles, and component styles
- **JavaScript** (`js/main.js`): Dynamic functionality and interactivity

### Design System

The CSS uses CSS custom properties (variables) for design tokens, making it easy to:

- Maintain consistent colors and spacing
- Implement dark mode support
- Customize the theme globally

### Layout Components

**Timeline** - Experience section uses a vertical timeline with animated dots  
**Skill Categories** - Skills organized by domain with hover effects  
**Stats Cards** - Visual representation of key metrics  
**Featured Items** - Highlighted projects with accent styling

### Features

- ✅ Responsive design (mobile-first approach)
- ✅ Dark mode support (via `prefers-color-scheme`)
- ✅ Print-friendly styles (optimized for PDF export)
- ✅ Semantic HTML5 elements
- ✅ Accessible navigation
- ✅ SEO-friendly (meta tags, JSON-LD structured data)
- ✅ Timeline layout for experience section
- ✅ Categorized skill display with visual grouping
- ✅ Stats cards for key achievements
- ✅ Featured project highlighting
- ✅ Smooth animations and transitions

## Development

### Local Development

Simply open `index.html` in a web browser. No build process required.

### Customization

1. **Colors & Theme**: Edit CSS custom properties in `css/styles.css` (`:root` selector)
2. **Content**: Update sections in `index.html`
3. **Functionality**: Add JavaScript functions in `js/main.js`

### Adding New Sections

1. Add a new `<section>` in `index.html`
2. Add a navigation link in the header's `<nav>` element
3. Style as needed using existing CSS classes or add new ones

## Browser Support

Modern browsers with support for:

- CSS Custom Properties (CSS Variables)
- CSS `color-mix()` function
- Flexbox and CSS Grid
- ES5+ JavaScript

## License

Personal project - feel free to use as inspiration for your own CV website.
