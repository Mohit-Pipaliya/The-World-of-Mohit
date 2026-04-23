import re

# 1. Read Contact.html
with open('Contact.html', 'r') as f:
    contact_html = f.read()

# Extract the contact section
contact_section_match = re.search(r'(<section id="contact-wrapper">.*?</section>)', contact_html, re.DOTALL)
if not contact_section_match:
    print("Could not find contact section")
    exit(1)

contact_section = contact_section_match.group(1)
# Rename id to "contact"
contact_section = contact_section.replace('id="contact-wrapper"', 'id="contact"')

# 2. Update index.html
with open('index.html', 'r') as f:
    index_html = f.read()

# Replace navbar links
index_html = index_html.replace('href="Project.html"', 'href="#projects"')
index_html = index_html.replace('href="Contact.html"', 'href="#contact"')

# Find the end of the certifications section
cert_end_match = re.search(r'(</section>\s*<!-- CERTIFICATE MODAL -->)', index_html)
if not cert_end_match:
    print("Could not find where to insert contact section")
    exit(1)

# Insert the contact section before the modals
index_html = index_html[:cert_end_match.start()] + '\n  <!-- CONTACT SECTION -->\n  ' + contact_section + '\n\n  ' + index_html[cert_end_match.start():]

# Add the contact script if not there
if 'contact-script.js' not in index_html:
    index_html = index_html.replace('</body>', '  <script type="module" src="contact-script.js"></script>\n</body>')

with open('index.html', 'w') as f:
    f.write(index_html)

# 3. Update style.css
with open('style.css', 'r') as f:
    style_css = f.read()

style_css = style_css.replace('#contact-wrapper', '#contact')

with open('style.css', 'w') as f:
    f.write(style_css)

print("Done updating index.html and style.css")
