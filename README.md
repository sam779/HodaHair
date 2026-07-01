# Hoda Hair - Bridal & Event Hairstylist Website

A luxury, elegant website for a bridal and event hairstylist. Built with HTML, CSS, and vanilla JavaScript.

## Features

### Pages
- **Home**: Hero section, about the artist, signature services, lookbook preview, testimonials, Instagram feed, and CTA
- **Services**: Detailed service offerings with pricing, add-ons, travel options, and booking process
- **Gallery**: Filtered portfolio gallery with lightbox viewer (browse by category)
- **Contact**: Contact information, inquiry form, location map, and FAQ section

### Interactive Elements
- **Responsive Navigation**: Fixed header with scroll-dependent styling
- **Gallery Lightbox**: Click any gallery item to view full-screen with keyboard navigation (arrow keys, escape)
- **Filter System**: Filter gallery by category (All, Bridal, Event, Editorial, Close-Up Detail, Before/After)
- **FAQ Accordion**: Expandable Q&A section
- **Contact Form**: Multi-field inquiry form with success message
- **Smooth Scroll**: Animated page transitions and scroll effects

### Design Features
- **Luxury Aesthetic**: Gold accents (#c9a86a), warm neutrals, elegant typography
- **Responsive Layout**: Fully responsive design using CSS Grid, Flexbox, and clamp() for fluid scaling
- **Animations**: Scroll-triggered reveals, hover effects, smooth transitions
- **Google Fonts**: Cormorant Garamond for headlines, Helvetica Neue for body text
- **SEO Ready**: Semantic HTML, Schema markup for HairSalon type

## File Structure

```
c:\Hoda Hair\
├── index.html          # Main HTML file with page structure
├── app.js              # JavaScript for interactivity and dynamic content
├── support.js          # Support utilities and polyfills
├── README.md           # This file
└── screenshots/        # Reference images folder
```

## Getting Started

### Local Development
Simply open `index.html` in a web browser. All functionality works without a server.

```bash
# Option 1: Double-click index.html
# Option 2: Use a local server
python -m http.server 8000  # Python 3
# or
npx http-server          # Node.js
```

Then visit: `http://localhost:8000`

## Customization

### Contact Information
Edit the contact details in `index.html`:
- Email: Line ~1000 (search for `hello@hodahair.com`)
- Phone: Line ~1005
- Address: Line ~1010

### Service Data
Edit service offerings in `app.js`:
- `signatureServices` (lines 30-35)
- `services` (lines 37-43)
- Pricing and add-ons are included

### Gallery Images
Add your actual images:
1. Replace placeholder items in the `galleryData` array (lines 15-29 in app.js)
2. Upload images to an `images/` folder
3. Update background images or create img elements

### FAQ Questions
Edit FAQ items in `app.js` (lines 61-65):
- Update `q` and `a` fields with your content

### Social Media Links
Update social media URLs in `index.html`:
- Instagram link: ~1004 (IG button)
- Pinterest link: ~1005 (PT button)
- TikTok link: ~1006 (TT button)
- Footer social links: ~1100+

### Colors & Styling
Main color variables in CSS:
- Primary Gold: `#c9a86a`
- Dark: `#17130f`
- Light: `#f6f1e9`
- Accent Gold: `#b08d57`

Edit these hex values in the `<style>` section to change the color scheme.

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Features to Implement

Current placeholders that need updating:
- [ ] Hero section background image (add actual bridal photo)
- [ ] About/portrait image
- [ ] Gallery images (replace placeholder backgrounds)
- [ ] Map embed (integrate Google Maps or similar)
- [ ] Social media links (connect Instagram, Pinterest, TikTok)
- [ ] Email form submission (connect to email service like Netlify Forms, Formspree)
- [ ] Phone/contact details
- [ ] Instagram feed integration (API or embed)

## Performance Notes

- Lightweight (no frameworks, pure vanilla JS)
- CSS animations use GPU-accelerated properties (transform, opacity)
- Responsive images scale with clamp() for optimal performance
- Column layout for gallery provides responsive masonry effect

## Deployment

Deploy to any static hosting:
- **Vercel**: `vercel deploy`
- **Netlify**: Drag & drop the folder
- **GitHub Pages**: Push to `gh-pages` branch
- **Traditional hosting**: FTP upload the files

## License

This is a custom client project. All code, design, and content are proprietary.

## Support

For questions about customization or features, refer to the inline comments in the code files.
