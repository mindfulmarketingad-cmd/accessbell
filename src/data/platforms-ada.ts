/**
 * Content for the "[Platform] ADA Compliance Checker" pages, keyed by the
 * platform id (its slug without "-accessibility-checker"). Each entry is written
 * for that platform: why its sites draw ADA complaints, which barriers to check
 * and where they come from, platform-specific steps, where to publish an
 * accessibility statement, and FAQs. Shared ADA background lives in the page.
 * `sc` is the WCAG success criterion each risk relates to.
 */
export type AdaContent = {
  exposure: string;
  risks: { sc: string; title: string; text: string }[];
  steps: string[];
  statement: string;
  faqs: { q: string; a: string }[];
};

export const ADA_CONTENT: Record<string, AdaContent> = {
  wordpress: {
    exposure: 'WordPress runs a huge share of small-business websites, and small businesses are the main target of ADA website claims. UsableNet found that 64% of the companies sued in the first half of 2025 had revenue under $25 million. On WordPress, the exposure comes from the layers around core: a theme, a page builder and plugins for forms, galleries, popups and cookies.',
    risks: [
      { sc: '1.1.1', title: 'Images with no alt text', text: 'Media library uploads, featured images and gallery plugins publish images with empty or file-name alt text unless someone fills it in.' },
      { sc: '3.3.2', title: 'Contact forms without labels', text: 'Form plugins and builder forms often show only placeholders, and error messages are not always announced.' },
      { sc: '2.1.1', title: 'Menus and popups a keyboard cannot use', text: 'Theme dropdowns, mobile menus and popup plugins that need a mouse cut off keyboard users from your pages.' },
      { sc: '1.4.3', title: 'Low-contrast theme colors', text: 'Light gray text and pale buttons set in the theme customizer fail contrast across every page at once.' },
    ],
    steps: [
      'List your theme, page builder and active plugins, then scan a page that uses each: the homepage, a post, a form page and, if you sell, a product page.',
      'Fix theme-level issues, such as contrast, focus styles and the main menu, in a child theme or the customizer, so every page benefits.',
      'Make alt text, real headings and descriptive link text part of publishing a post, and re-scan after plugin and theme updates.',
    ],
    statement: 'Create a normal WordPress page for your accessibility statement and add it to the footer menu under Appearance > Menus, so it appears on every page.',
    faqs: [
      { q: 'Is my WordPress site ADA compliant?', a: 'WordPress core has an accessibility-ready baseline, but compliance depends on your theme, builder, plugins and content. Run the ADA scan to see the automated issues, and test key tasks by hand.' },
      { q: 'Will an ADA plugin or overlay protect my WordPress site?', a: 'No. Plugins that add a toolbar or patch the page in the browser do not fix the markup your site outputs, and sites using widgets have still been sued. Fix the issues in the theme and content.' },
      { q: 'How often should I run an ADA check on WordPress?', a: 'After every theme, builder and plugin update, and after any big content change. AccessBell Pro rescans on a schedule and emails you when something new fails.' },
    ],
  },
  shopify: {
    exposure: 'Most website accessibility lawsuits are filed against online stores, and Shopify merchants are exactly that audience. Shopify provides themes and a checkout, but the product pages, collection filters, apps and promotional content on your store are yours to keep accessible.',
    risks: [
      { sc: '1.1.1', title: 'Product images with no description', text: 'Product photos and banner images uploaded without alt text hide your products from screen reader users.' },
      { sc: '4.1.2', title: 'Variant pickers and quick-add buttons', text: 'Swatches, size selectors and icon-only cart buttons often have no accessible name or keyboard support.' },
      { sc: '2.4.7', title: 'Lost focus in drawers and popups', text: 'Cart drawers, quick views and newsletter popups added by themes and apps can trap or lose keyboard focus.' },
      { sc: '1.4.3', title: 'Sale badges and promo banners', text: 'White text on bright badges and light gray prices fail contrast, and they often sit on the exact products you want to sell.' },
    ],
    steps: [
      'Scan your homepage, a collection page and a product page, since each is built from different theme sections.',
      'Check each app that adds a widget to your store, such as reviews, upsells and popups, because an app issue appears on every page it loads on.',
      'Shopify controls much of the checkout, so test it by hand with a keyboard, and report anything you find there to Shopify.',
    ],
    statement: 'Add a page under Online Store > Pages for your accessibility statement and link it from the footer menu, so shoppers can find it and report a problem.',
    faqs: [
      { q: 'Is my Shopify store ADA compliant?', a: 'Shopify’s themes are a starting point, but your product content, apps and customizations decide the result. The ADA scan shows the automated issues on the pages you test, and the checkout needs a manual check.' },
      { q: 'Do Shopify apps affect ADA compliance?', a: 'Yes. A reviews, popup or upsell app can add inaccessible markup to every page. Scan before and after installing one, and remove apps that cause problems you cannot fix.' },
      { q: 'Can I be sued over a Shopify store?', a: 'Online stores are the most common target of ADA website claims, whichever platform they use. Fixing issues and keeping dated records of your testing puts you in a stronger position.' },
    ],
  },
  webflow: {
    exposure: 'Webflow gives designers complete control of the code, which makes accessibility a design decision rather than a platform feature. That is good for agencies and in-house teams, but it also means ADA exposure follows every custom interaction, every div used as a heading and every animation added to a page.',
    risks: [
      { sc: '1.3.1', title: 'Headings and landmarks set by appearance', text: 'Text elements styled to look like headings, and layouts built from divs with no landmark, make the page structure unreadable to assistive technology.' },
      { sc: '1.1.1', title: 'CMS images without alt text', text: 'Collection items and imported images keep empty alt fields, so every item in a collection repeats the same gap.' },
      { sc: '4.1.2', title: 'Custom interactions and menus', text: 'Tabs, dropdowns and modals built with interactions can lack roles, names and keyboard behavior.' },
      { sc: '2.2.2', title: 'Animations that cannot be paused', text: 'Looping sliders, marquee effects and scroll animations start on their own with no way to stop them.' },
    ],
    steps: [
      'Review the page structure in the Navigator: one h1 per page, headings in order, and tags that reflect meaning rather than size.',
      'Add alt text in the CMS collection fields and the asset panel, so new items inherit good practice.',
      'Test every interaction with Tab, Enter and Escape, and add a pause control or remove autoplay from moving content.',
    ],
    statement: 'Add a static page for your accessibility statement, link it in the footer symbol so it appears on every page, and include a contact method for feedback.',
    faqs: [
      { q: 'Is Webflow ADA compliant out of the box?', a: 'Webflow supplies the controls, but you write the structure. A well-built Webflow site can be very accessible, and a rushed one can fail badly, so scan the published site.' },
      { q: 'Does an ADA widget help on Webflow?', a: 'It will not change the code your pages output. Fix the issues in the Designer, and treat any toolbar as an optional extra for visitors.' },
      { q: 'Can I scan a Webflow staging site?', a: 'AccessBell Pro can scan staging and pre-launch sites, including ones behind custom headers, so you can catch issues before publishing to your domain.' },
    ],
  },
  squarespace: {
    exposure: 'Squarespace sites are popular with small service businesses, restaurants, creatives and local shops, the kinds of businesses that rarely have an accessibility specialist. Its templates are polished, but ADA problems appear in the content people add: images of text, unlabeled forms and embedded booking tools.',
    risks: [
      { sc: '1.1.1', title: 'Text baked into images', text: 'Menus, price lists and event flyers uploaded as images cannot be read by screen readers or resized.' },
      { sc: '1.4.3', title: 'Text over background images', text: 'Light text over a photo in a hero or banner section can fall below the contrast minimum on some images.' },
      { sc: '3.3.2', title: 'Form blocks and embedded schedulers', text: 'Contact forms with placeholder-only fields, and third-party booking or ordering embeds that sit outside the template.' },
      { sc: '2.4.4', title: 'Vague links and buttons', text: 'Repeated “Learn more” and “Click here” buttons give screen reader users no idea where each one goes.' },
    ],
    steps: [
      'Replace image-only menus, flyers and price lists with real text, or add the same content as a page beside the image.',
      'Check text-over-image sections on desktop and mobile, and choose a darker overlay or a different image where contrast fails.',
      'Test your booking, ordering or payment embed on its own, because it comes from another company and a template setting will not fix it.',
    ],
    statement: 'Create a page for your accessibility statement and add it to the footer navigation in Pages, so it shows in the footer of every page.',
    faqs: [
      { q: 'Is my Squarespace site ADA compliant?', a: 'Squarespace’s templates are a good base, but what you add decides compliance: images, text colors, forms and embeds. Run the ADA scan on your key pages to see where you stand.' },
      { q: 'Does Squarespace let me fix alt text and headings?', a: 'Yes. You can add alt text to images and choose heading levels in the editor, which fixes many of the most common issues without code.' },
      { q: 'Will a restaurant Squarespace site get ADA complaints?', a: 'Restaurants and local businesses are regularly named in ADA website claims, especially for menus that are images or PDFs. Put the menu in accessible text.' },
    ],
  },
  wix: {
    exposure: 'Wix puts a drag-and-drop editor between you and the code, so many Wix owners never see the markup behind their site. ADA exposure builds quietly: every strip, gallery and animation is placed visually, and the reading order, labels and alt text depend on settings that are easy to skip.',
    risks: [
      { sc: '1.3.2', title: 'Reading order that follows the layout', text: 'Elements dragged into place can be read in a different order than they appear, which confuses screen reader and keyboard users.' },
      { sc: '1.1.1', title: 'Galleries and strips without alt text', text: 'Image galleries, slideshows and strips often hold dozens of pictures that were never described.' },
      { sc: '2.2.2', title: 'Animations and autoplay', text: 'Entrance effects, scroll animations and auto-advancing slideshows start without being asked and cannot be paused.' },
      { sc: '3.3.2', title: 'Forms and Wix apps', text: 'Forms and apps from the Wix App Market, such as bookings and stores, bring their own labels and error handling.' },
    ],
    steps: [
      'Check the reading order of every page with Tab, and use the editor’s order settings so it matches what visitors see.',
      'Add alt text to each image or mark it decorative, and give the page a real h1 and a descriptive title.',
      'Review Wix apps one at a time, since each loads its own markup that you cannot edit.',
    ],
    statement: 'Add a page for your accessibility statement, include it in the site menu or footer, and put a feedback email or form on it.',
    faqs: [
      { q: 'Is a Wix site ADA compliant?', a: 'Wix gives you accessibility settings and tools, but each site depends on how it is built and filled in. The ADA scan shows what is detectable on the pages you test.' },
      { q: 'Can I fix everything in the Wix editor?', a: 'Much of it, such as alt text, headings, link text and colors. Some app markup cannot be edited, which is why scanning the published site matters.' },
      { q: 'Does a Wix accessibility widget make me compliant?', a: 'No. A widget changes the page in the browser but not your code, and it has not protected sites from complaints. Fix the issues in the site itself.' },
    ],
  },
  ionos: {
    exposure: 'IONOS serves a large number of European and international small businesses, and it offers WordPress hosting alongside its MyWebsite builder. If you sell to shoppers in the EU, the European Accessibility Act applies to your online store as well as the ADA if you also serve US customers, so one clean accessibility record serves both.',
    risks: [
      { sc: '1.1.1', title: 'Builder and template images', text: 'Stock photos and hero images in templates ship with no description unless you add one.' },
      { sc: '1.4.3', title: 'Template color schemes', text: 'Pale accent colors and light text over images look modern and often fail contrast.' },
      { sc: '3.3.2', title: 'Contact and booking forms', text: 'Forms built with the builder or a WordPress plugin may show placeholders only and give unclear errors.' },
      { sc: '3.1.1', title: 'Wrong or missing page language', text: 'Sites in German, French or English that never set the page language are read in the wrong voice by screen readers.' },
    ],
    steps: [
      'Find out whether your site runs on the MyWebsite builder or on WordPress, and use that platform’s guidance for the fixes.',
      'Set the page language for each language version of your site, and check that each one is detected correctly.',
      'If you sell to EU consumers, read our guide to the European Accessibility Act, and keep dated scan records.',
    ],
    statement: 'Publish your accessibility statement as a normal page in the language of your site, and link it from the footer of every language version.',
    faqs: [
      { q: 'Does my IONOS host make my site ADA compliant?', a: 'No. Hosting does not decide accessibility. Your builder, theme, plugins and content do, so the site needs to be tested directly.' },
      { q: 'Does the ADA apply to a site hosted in Europe?', a: 'It can, if you serve customers in the US. If you serve EU consumers, the European Accessibility Act applies as well. Testing to WCAG 2.2 AA covers both.' },
      { q: 'Can AccessBell scan a multilingual IONOS site?', a: 'Yes. Scan each language version, since each can have its own content and its own mistakes.' },
    ],
  },
  siteground: {
    exposure: 'SiteGround is best known for WordPress hosting, so most ADA risk on a SiteGround site is WordPress risk: the theme, builder and plugins. What is different is the server side. Caching and optimization features can serve an old version of a page after you fix it, which makes a good fix look like it failed.',
    risks: [
      { sc: '1.1.1', title: 'Images added through the media library', text: 'Uploaded images keep empty alt text unless it is filled in at upload.' },
      { sc: '2.4.7', title: 'Optimization breaking focus styles', text: 'Minified or combined CSS from performance tools can drop or override focus styles added by a theme.' },
      { sc: '3.3.2', title: 'Form plugins', text: 'Contact and booking plugins often rely on placeholders and unannounced errors.' },
      { sc: '2.4.1', title: 'No way to skip repeated navigation', text: 'Themes without a skip link force keyboard users to tab through the whole menu on every page.' },
    ],
    steps: [
      'Scan the live page after clearing the SiteGround caching you use, so you test the version visitors get.',
      'After enabling any minification or combine feature, rescan to make sure styles and scripts still work for keyboard users.',
      'Use the staging tool for theme and plugin changes, scan the staging copy, and push to the live site only when it passes.',
    ],
    statement: 'Add your accessibility statement as a WordPress page linked from the footer menu, and update it after each round of fixes.',
    faqs: [
      { q: 'Is a SiteGround site ADA compliant?', a: 'The host does not decide this. SiteGround runs your WordPress site, and compliance depends on the theme, plugins and content you put on it.' },
      { q: 'Why does my fix not show in the scan?', a: 'Cached pages can serve the old version. Clear the site and plugin caches, then rescan the live page.' },
      { q: 'Can I scan the staging site first?', a: 'Yes, if the staging site is reachable from the internet. AccessBell Pro supports staging scans, including ones behind custom headers.' },
    ],
  },
  bluehost: {
    exposure: 'Bluehost is where many first websites begin, often a WordPress site set up by a guided onboarding flow, sometimes with WooCommerce. Sites that keep their starter theme, sample content and default plugins can carry accessibility gaps for years, because nobody sat down and tested them.',
    risks: [
      { sc: '1.1.1', title: 'Starter images and sample content', text: 'Template images and placeholder content left in place often have no useful alt text.' },
      { sc: '2.4.2', title: 'Default or duplicate page titles', text: 'Pages that share a generic title are hard to tell apart in browser tabs and screen readers.' },
      { sc: '1.4.3', title: 'Default theme colors', text: 'Light accent colors in starter themes fail contrast for body text and buttons.' },
      { sc: '3.3.2', title: 'Store and contact forms', text: 'WooCommerce and contact form plugins added during setup may have unlabeled fields.' },
    ],
    steps: [
      'Replace sample content, and give every real page its own title and a single h1.',
      'Check the colors that came with your theme, and change buttons and text that fail contrast.',
      'Scan a product or form page if you added a store or contact form during setup, and fix the labels it reports.',
    ],
    statement: 'Create a page for your accessibility statement and add it to your footer menu, so customers can find it from any page.',
    faqs: [
      { q: 'Does Bluehost provide ADA compliance?', a: 'Bluehost provides hosting and setup tools. Compliance depends on your site’s theme, content and plugins, so it needs to be tested separately.' },
      { q: 'I just launched my site on Bluehost. Where do I start?', a: 'Run the ADA scan on your homepage and one inner page, fix the critical issues first, and add alt text and real headings as you publish.' },
      { q: 'Is a small business site at risk of an ADA claim?', a: 'Yes. UsableNet found that 64% of companies sued in the first half of 2025 had revenue under $25 million.' },
    ],
  },
  'hosting-com': {
    exposure: 'Hosting.com customers run all sorts of sites: WordPress, store software, custom PHP and static sites. That mix is the point to remember for ADA compliance. There is no single platform to fix, so the check has to start from the page that visitors actually get.',
    risks: [
      { sc: '1.3.1', title: 'Structure that depends on the software', text: 'The heading, list and table structure comes from whatever you run on the host, so each site needs its own check.' },
      { sc: '1.1.1', title: 'Images and downloads', text: 'Photos, logos and PDF brochures published without text alternatives are common on small business sites.' },
      { sc: '2.1.1', title: 'Custom scripts and widgets', text: 'Homemade menus, sliders and popups add behavior that does not work without a mouse.' },
      { sc: '3.3.1', title: 'Forms that fail silently', text: 'Handmade or plugin forms may show errors only in color or not at all.' },
    ],
    steps: [
      'Note which software powers each of your sites on the host, then follow that platform’s checker for fixes.',
      'Scan a representative page from each site, since a shared server can hold sites that look nothing alike.',
      'Keep a dated record of scans and fixes for each domain, so you can show your effort if a customer asks.',
    ],
    statement: 'Publish your accessibility statement on each domain you run, linked from its footer, with a way for visitors to report a problem.',
    faqs: [
      { q: 'Is my Hosting.com site ADA compliant?', a: 'Hosting does not decide this. The software and content on your site do, and a scan of the live pages shows the automated issues.' },
      { q: 'I run several sites on one hosting account. How do I check them all?', a: 'Scan each domain separately. AccessBell Pro monitors up to 500 pages per domain on a schedule.' },
      { q: 'Do I need to change hosts to fix accessibility problems?', a: 'No. Accessibility problems live in your site’s code and content, not in the hosting, so they move with the site.' },
    ],
  },
  godaddy: {
    exposure: 'GoDaddy is the first stop for many sole traders, who often buy a domain, a builder plan and an email address in one place. The result is a lot of very small sites with no one assigned to accessibility, which fits the profile of the businesses that most often receive ADA demand letters.',
    risks: [
      { sc: '1.1.1', title: 'Builder photos without descriptions', text: 'Images added in the website builder often keep no alt text or just the file name.' },
      { sc: '1.4.3', title: 'Contrast on themes and buttons', text: 'Theme colors, light fonts and buttons with white text on a bright fill fail contrast.' },
      { sc: '3.3.2', title: 'Contact forms', text: 'The contact section of a builder site may use placeholders instead of visible labels.' },
      { sc: '2.4.4', title: 'Click here and learn more links', text: 'Repeated, vague link and button text that does not say where it leads.' },
    ],
    steps: [
      'Open each page in the builder and add alt text to images that carry meaning, marking decorative ones as such.',
      'Pick theme colors that pass contrast, and make button text readable against its fill.',
      'If your site is on GoDaddy WordPress hosting instead, follow the WordPress checker for theme and plugin fixes.',
    ],
    statement: 'Add a page for your accessibility statement and link it in your site’s footer or navigation, with a contact email for feedback.',
    faqs: [
      { q: 'Is a GoDaddy website ADA compliant?', a: 'It depends on how the site was built and filled in. The builder gives you some controls, but you have to use them, so run a scan to see the automated issues.' },
      { q: 'Do I need a lawyer or a scan first?', a: 'A scan is a fast first step and costs nothing. If you receive a demand letter, speak to a lawyer who handles ADA cases.' },
      { q: 'Does GoDaddy hosting protect me from lawsuits?', a: 'No. Hosting and domain services do not change your site’s accessibility. Your site’s content and code do.' },
    ],
  },
  hostgator: {
    exposure: 'HostGator customers typically run a cPanel account with a one-click WordPress install or a template site from its website builder. Those quick starts mean the first version of the site often goes live untested, and small mistakes in templates and plugins then repeat on every page.',
    risks: [
      { sc: '1.1.1', title: 'Template images and logos', text: 'Template and logo images that never get a description.' },
      { sc: '1.3.1', title: 'Pages with no real structure', text: 'Headings picked for size, and layouts where nothing is marked up as a list, table or landmark.' },
      { sc: '1.4.3', title: 'Pale template palettes', text: 'Light gray text and thin fonts that look clean in a template but fail contrast.' },
      { sc: '3.3.2', title: 'Plugin forms and newsletter boxes', text: 'Sign-up and contact forms that use placeholders only.' },
    ],
    steps: [
      'After a one-click install, change the demo content and run the scan before you promote the site.',
      'Check heading order on every page you add, with one h1 and then h2 and h3 in sequence.',
      'Fix colors and form labels in the theme, then rescan to confirm they cleared.',
    ],
    statement: 'Publish an accessibility statement page and link it from the footer menu, with a contact method for visitors who hit a barrier.',
    faqs: [
      { q: 'Is a HostGator site ADA compliant by default?', a: 'No. The default site from any installer is a starting point, and the theme, plugins and content you add decide the result.' },
      { q: 'How do I check my HostGator website for ADA issues?', a: 'Run the ADA scan on your homepage and an inner page, and fix critical issues first. Then add the rest of your key pages.' },
      { q: 'Does ADA compliance cost a lot?', a: 'Fixing the most common issues, such as alt text, labels and contrast, is mostly time rather than money. A flat-price monitoring tool keeps the cost predictable.' },
    ],
  },
  dreamhost: {
    exposure: 'DreamHost hosts a lot of blogs, portfolios and publishing sites, which means a steady stream of new content. ADA risk on content sites tends to build up post by post: an image without alt text here, a vague link there, until thousands of small gaps have accumulated.',
    risks: [
      { sc: '1.1.1', title: 'Blog and portfolio images', text: 'Featured images and gallery pictures published without alt text, across hundreds of posts.' },
      { sc: '2.4.4', title: 'Read more links', text: 'Archive and category pages full of identical “read more” links.' },
      { sc: '1.3.1', title: 'Bold text used as headings', text: 'Long posts where sections are bold paragraphs instead of headings.' },
      { sc: '1.2.2', title: 'Video without captions', text: 'Embedded videos and podcasts with no captions or transcript.' },
    ],
    steps: [
      'Set a publishing checklist for every post: alt text, real headings, descriptive links and captions on video.',
      'Scan an archive page and a recent post, since templates repeat issues across both.',
      'Work backward through older posts in order of traffic, fixing the most-visited first.',
    ],
    statement: 'Add an accessibility statement page and link it in the footer or sidebar, so readers can ask for content in another format.',
    faqs: [
      { q: 'Does a personal blog need to be ADA compliant?', a: 'The ADA covers businesses open to the public, so a purely personal blog is less exposed. A blog that sells, advertises or promotes a business is a different matter.' },
      { q: 'How do I fix hundreds of old posts?', a: 'Start with the most visited ones. Template-level fixes, such as link wording and contrast, correct every post at once.' },
      { q: 'Does DreamHost offer ADA tools?', a: 'Hosting does not provide accessibility compliance. Test your site directly with a scanner.' },
    ],
  },
  woocommerce: {
    exposure: 'A WooCommerce store combines the two biggest ADA risk areas: a WordPress site full of plugins, and an online store, which is the most common target of website claims. Cart and checkout problems matter most, because an inaccessible checkout means a customer cannot buy.',
    risks: [
      { sc: '4.1.2', title: 'Variation swatches and quantity controls', text: 'Custom swatches and steppers with no accessible name or keyboard support.' },
      { sc: '3.3.1', title: 'Checkout errors', text: 'Validation messages that appear in red text but are not announced or tied to their fields.' },
      { sc: '2.4.3', title: 'Mini cart and off-canvas drawers', text: 'Drawers that do not move focus in, or let focus wander behind them.' },
      { sc: '1.1.1', title: 'Product images', text: 'Product galleries and zoom viewers filled with images that have no alt text.' },
    ],
    steps: [
      'Test the full purchase path by hand: product page, add to cart, cart, checkout, confirmation, using only the keyboard.',
      'Scan the shop, a product page and the cart, and fix theme or extension issues in order of severity.',
      'Review every extension that changes the cart or checkout, because each one can replace accessible markup with its own.',
    ],
    statement: 'Publish your accessibility statement as a page and link it in the footer menu and on the My Account page, where customers who need help will look.',
    faqs: [
      { q: 'Is my WooCommerce checkout ADA compliant?', a: 'WooCommerce improves its own components, but extensions and customizations can change them. Test your checkout by hand with a keyboard, and scan the pages that are public.' },
      { q: 'Which WooCommerce pages should I scan first?', a: 'The shop page, a product page with variations, the cart and the checkout. These are where shoppers spend their time and where barriers cost sales.' },
      { q: 'Do WooCommerce stores get sued?', a: 'Online stores are the most common target of ADA website claims. Keeping fixes and dated records protects you better than hoping for the best.' },
    ],
  },
  bigcommerce: {
    exposure: 'BigCommerce merchants often run larger catalogs than typical small shops, with faceted filters, many product options and custom Stencil themes. Large catalogs are an ADA risk of their own, because the same template problem is repeated on thousands of pages.',
    risks: [
      { sc: '4.1.2', title: 'Product options and filters', text: 'Option swatches and filter groups with no names, state or keyboard support.' },
      { sc: '1.1.1', title: 'Catalog images at scale', text: 'Bulk imports that leave alt text empty on thousands of product images.' },
      { sc: '2.4.3', title: 'Quick view and cart preview', text: 'Modals that do not take focus when they open or return it when they close.' },
      { sc: '2.4.7', title: 'Restyled focus rings', text: 'Custom themes that remove the visible focus indicator on links and buttons.' },
    ],
    steps: [
      'Fill in alt text through your catalog import or product editor, so new products arrive with it.',
      'Fix theme templates once in your Stencil theme, and scan a category, product and cart page to confirm.',
      'Audit scripts added in Script Manager, because one inaccessible chat or popup script affects every page.',
    ],
    statement: 'Add a web page for your accessibility statement and link it from the storefront footer menu.',
    faqs: [
      { q: 'Is a BigCommerce store ADA compliant?', a: 'BigCommerce documents how its default theme targets WCAG, but custom themes, apps and content decide your result. Scan your own store.' },
      { q: 'Who is responsible for BigCommerce checkout accessibility?', a: 'BigCommerce controls much of the checkout, so report problems to them, and focus your own work on the theme and content you control.' },
      { q: 'How do I monitor a large catalog?', a: 'AccessBell Pro scans up to 500 pages per domain daily. For a big catalog, scan a sample of each template type, because the same template repeats across products.' },
    ],
  },
  magento: {
    exposure: 'Self-hosted Magento stores carry the most technical debt of any e-commerce platform in this list: old versions, many extensions and heavy customization. That makes ADA review more complicated, and a store that has not been scanned in years may have accumulated many problems.',
    risks: [
      { sc: '4.1.2', title: 'Luma swatches and layered navigation', text: 'Configurable swatches and filters without names, state or keyboard access.' },
      { sc: '1.4.3', title: 'Buttons and sale prices', text: 'Add to cart buttons and discounted prices with insufficient contrast.' },
      { sc: '3.3.1', title: 'Checkout step errors', text: 'Script-drawn checkout steps that show errors without announcing them.' },
      { sc: '1.1.1', title: 'Catalog image alt text', text: 'Imported products with blank or file-name alt text.' },
    ],
    steps: [
      'Scan your key templates, which are the category, product, cart and checkout pages, and fix issues in a child theme.',
      'List the extensions that add front-end elements, and test each one that changes the menu, filters or checkout.',
      'Plan fixes around upgrades, since a version upgrade can overwrite theme changes and reintroduce problems.',
    ],
    statement: 'Create a CMS page for your accessibility statement and add it to the footer links block.',
    faqs: [
      { q: 'Is Magento ADA compliant?', a: 'Magento is a platform you configure and host yourself, so compliance depends on your theme, extensions and content. The default Luma theme has known gaps, which is why scanning matters.' },
      { q: 'Does Hyvä make a store compliant?', a: 'A different front end can give a better starting point, but it still needs testing. No theme guarantees compliance.' },
      { q: 'Should I fix accessibility before upgrading?', a: 'Scan before and after an upgrade. A scan before gives you a baseline, and a scan after shows what the upgrade changed.' },
    ],
  },
  'adobe-commerce': {
    exposure: 'Adobe Commerce is used by larger merchants and B2B sellers, whose sites are bigger and more complex, with account areas, quote tools and multiple storefronts. More pages mean more templates to test, and large brands are more visible targets for ADA complaints and for the European Accessibility Act.',
    risks: [
      { sc: '1.3.1', title: 'Page Builder content structure', text: 'Rows and banners built visually with skipped heading levels and unlabeled sections.' },
      { sc: '3.3.2', title: 'B2B forms and tables', text: 'Quick order, requisition list and quote forms with missing labels and header cells.' },
      { sc: '3.1.1', title: 'Language on storefront views', text: 'Translated store views that do not set the page language correctly.' },
      { sc: '4.1.2', title: 'Search and recommendation widgets', text: 'Live search overlays and carousels without names, roles or announcements.' },
    ],
    steps: [
      'Scan every store view and language, not just the main storefront, and keep a dated record of each.',
      'Set content rules for Page Builder: real headings, alt text on all images and descriptive buttons.',
      'Check B2B account pages as a logged-in buyer would, by hand, because the free scan only reaches public pages.',
    ],
    statement: 'Publish your accessibility statement as a CMS page per store view, in the right language, and link it in each footer.',
    faqs: [
      { q: 'Is Adobe Commerce ADA compliant?', a: 'Adobe Commerce is a platform, and compliance is a property of your storefront. A scan shows the automated issues for each theme and view.' },
      { q: 'Do enterprise merchants face more ADA risk?', a: 'Larger brands are more visible, and repeat claims against companies that were already sued are common. UsableNet counted 1,427 lawsuits in 2025 against companies sued before.' },
      { q: 'Can AccessBell cover several storefronts?', a: 'Yes. Add each domain, and each is monitored and recorded separately.' },
    ],
  },
  drupal: {
    exposure: 'Drupal is popular with universities, nonprofits and government agencies, the organizations most likely to be held to formal accessibility standards such as Section 508 and the ADA Title II rule for state and local governments. Drupal core is built for accessibility, so the gaps usually come from custom themes and editors.',
    risks: [
      { sc: '1.3.1', title: 'Tables and Views without headers', text: 'Views tables and data lists built without header cells.' },
      { sc: '2.4.1', title: 'Custom themes without skip links', text: 'Twig themes that drop the skip link and landmarks core provides.' },
      { sc: '1.1.1', title: 'Media without alt text', text: 'Media library items and editor-inserted images with blank alt text.' },
      { sc: '3.3.2', title: 'Webform labels and errors', text: 'Complex multi-step Webforms with hidden labels and silent errors.' },
    ],
    steps: [
      'If you are a public entity, check which standard applies to you, and note the compliance dates for state and local governments.',
      'Set image fields to require alt text and train editors on headings and link text.',
      'Scan after module and core updates, and keep records of results for your accessibility file.',
    ],
    statement: 'Publish an accessibility statement as a basic page linked in the footer menu, with the standard you follow, known gaps and a contact for feedback.',
    faqs: [
      { q: 'Is a Drupal site ADA compliant?', a: 'Drupal core aims for WCAG 2.1 AA, but your theme, modules and content decide the result. Scan the live site.' },
      { q: 'Does the ADA Title II rule apply to my Drupal site?', a: 'If you are a state or local government entity, the rule requires WCAG 2.1 AA, with compliance dates in April 2027 and April 2028 after the 2026 extension.' },
      { q: 'Can I use AccessBell for Section 508 on Drupal?', a: 'Yes. Choose the Section 508 preset for WCAG 2.0 AA checks, or the ADA preset for WCAG 2.1 AA.' },
    ],
  },
  joomla: {
    exposure: 'Joomla sites tend to be long-lived, often running for years through several upgrades with a commercial template and a stack of extensions. Associations, schools and local organizations often use Joomla, and an old site can quietly accumulate ADA problems that no one is assigned to fix.',
    risks: [
      { sc: '1.3.1', title: 'Module titles breaking heading order', text: 'Module titles rendered as headings in odd places on the page.' },
      { sc: '1.1.1', title: 'Editor-inserted images', text: 'Images inserted into articles without alt text.' },
      { sc: '2.2.2', title: 'Sliders and galleries', text: 'Extensions that autoplay slides with no pause control.' },
      { sc: '3.3.2', title: 'Form extensions', text: 'Contact and form extensions with placeholders and unannounced errors.' },
    ],
    steps: [
      'Check the age of your template and extensions, since unmaintained code is a common source of old problems.',
      'Review template overrides, which can silently remove accessibility features Joomla provides.',
      'Fix content habits, such as alt text and real headings, then scan every few weeks.',
    ],
    statement: 'Create an article for your accessibility statement and add it to a footer menu module.',
    faqs: [
      { q: 'Is Joomla ADA compliant?', a: 'Joomla 4 and later include an accessibility-minded default template, but your template, extensions and content determine the result.' },
      { q: 'My Joomla site is old. Is it a risk?', a: 'Older sites are more likely to have accumulated issues, and unsupported extensions are hard to fix. A scan shows where to start.' },
      { q: 'Does a Joomla extension make my site compliant?', a: 'No extension can fix everything. Fix the markup and content, and keep scanning.' },
    ],
  },
  duda: {
    exposure: 'Duda is used by agencies to build and manage many client sites, which changes how ADA risk looks: one agency template decision can be repeated across dozens of clients. An accessibility mistake in your agency’s standard layout is a mistake delivered many times.',
    risks: [
      { sc: '1.4.3', title: 'Hero text over photos', text: 'Standard hero sections that put light text on images.' },
      { sc: '1.1.1', title: 'Gallery and slider images', text: 'Widgets filled with images without descriptions, or unchecked AI-written ones.' },
      { sc: '1.3.2', title: 'Different mobile and desktop order', text: 'Mobile layouts that reorder content so the reading order no longer makes sense.' },
      { sc: '3.3.2', title: 'Form widgets', text: 'Forms using placeholders and success messages that are not announced.' },
    ],
    steps: [
      'Test your agency’s base template once, fix it, and use the corrected version for new clients.',
      'Scan each client site before handover, and keep the dated results as part of the delivery.',
      'Check desktop and mobile layouts separately with a keyboard, since they are built separately in Duda.',
    ],
    statement: 'Add a statement page to each client site and link it from the footer, with the client’s own contact details.',
    faqs: [
      { q: 'Are my clients’ Duda sites ADA compliant?', a: 'Only a scan and manual testing of each site can tell you. Duda provides accessibility tools, but each client’s content and settings vary.' },
      { q: 'Can agencies be held responsible for client site accessibility?', a: 'Claims are usually made against the business that owns the site, but clients increasingly expect agencies to deliver accessible work. Dated records help both sides.' },
      { q: 'How do agencies monitor many Duda sites?', a: 'Add each client domain to AccessBell, which rescans on a schedule and keeps a record for each.' },
    ],
  },
  weebly: {
    exposure: 'Many Weebly sites belong to small shops, clubs and sole traders who built them years ago and have rarely revisited them. Weebly is now part of Square, and an older site on an older theme is easy to forget, until a demand letter arrives.',
    risks: [
      { sc: '1.1.1', title: 'Image areas with no alt text field', text: 'Some image areas, such as header and banner images, may not offer an alt text field.' },
      { sc: '2.2.2', title: 'Slideshows', text: 'Auto-advancing slideshows with no pause or stop control.' },
      { sc: '1.4.3', title: 'Theme colors', text: 'Light text on a photo header, and pale gray body text.' },
      { sc: '1.3.1', title: 'Large text instead of headings', text: 'Big bold paragraphs used in place of heading styles.' },
    ],
    steps: [
      'Open each page in the editor, add alt text where fields exist, and describe key images in nearby text where they do not.',
      'Switch large text to the real Heading style, and choose theme colors that pass contrast.',
      'Decide whether the platform still suits you. If the editor will not let you fix issues, a move to a builder with more control may be the right fix.',
    ],
    statement: 'Add a page for your accessibility statement and link it in the site navigation or footer.',
    faqs: [
      { q: 'Is Weebly ADA compliant?', a: 'Weebly gives you some tools, but not every part can be fixed in the editor. The scan shows what your site has today.' },
      { q: 'Should I move off Weebly because of the ADA?', a: 'Not necessarily. Scan first. If the problems cannot be fixed in the editor, moving to a platform with more control is worth considering.' },
      { q: 'Does adding a widget to Weebly help?', a: 'It will not fix your site’s code. Address the issues in the pages first.' },
    ],
  },
  'hubspot-cms': {
    exposure: 'HubSpot CMS sites are owned by marketing teams, who publish landing pages quickly and in volume. ADA exposure scales with the number of pages, forms and campaigns, and a fast-moving campaign calendar leaves little time for review.',
    risks: [
      { sc: '3.3.2', title: 'HubSpot forms with hidden labels', text: 'Forms restyled to show placeholders only, repeated across many landing pages.' },
      { sc: '2.4.4', title: 'Identical CTA buttons', text: 'Many “Learn more” and “Get started” buttons on one page with no distinguishing text.' },
      { sc: '2.4.7', title: 'Popups and slide-ins', text: 'Pop-up forms and banners that open without moving focus.' },
      { sc: '4.1.2', title: 'Chat and meetings embeds', text: 'Embedded widgets with missing names, titles and focus handling.' },
    ],
    steps: [
      'Fix the form template once, so every landing page that embeds the form is corrected.',
      'Add an accessibility check to your campaign launch list: scan the page before you send traffic.',
      'Review the chat bubble, meetings link and cookie banner, which load on many pages at once.',
    ],
    statement: 'Publish a statement page in HubSpot and link it from the global footer module so it appears on every page.',
    faqs: [
      { q: 'Is a HubSpot website ADA compliant?', a: 'HubSpot provides accessible building blocks, but pages vary with the content, forms and embeds that marketers add. Scan the pages you publish.' },
      { q: 'Do HubSpot landing pages need to be accessible?', a: 'Yes. They are part of your website, and a form that cannot be completed by a screen reader user loses you that lead and creates risk.' },
      { q: 'How can marketing teams stay on top of this?', a: 'Scan new landing pages before launch and let a scheduled monitor catch problems introduced later.' },
    ],
  },
  framer: {
    exposure: 'Framer sites are designed to impress, with layered animation, hover effects and heavy imagery. A design-led build is where ADA problems like autoplaying movement, hover-only interactions and text over images appear, and where accessibility has to be designed in rather than added later.',
    risks: [
      { sc: '2.2.2', title: 'Tickers and autoplay carousels', text: 'Logo tickers, marquees and looping video that never stop.' },
      { sc: '4.1.2', title: 'Icon-only buttons', text: 'Social and menu icons built from frames with no ARIA label.' },
      { sc: '1.3.1', title: 'Text layers without heading tags', text: 'Large styled text with no heading tag, so the outline is empty.' },
      { sc: '2.1.1', title: 'Hover-only content', text: 'Menus and cards that reveal content only on hover.' },
    ],
    steps: [
      'Set a heading tag on each text layer that is a heading, and add ARIA labels to icon-only elements.',
      'Turn on the reduced-motion setting, and add pause controls to anything that moves for more than five seconds.',
      'Make every hover state available on focus and tap, and test the finished site with a keyboard.',
    ],
    statement: 'Add a page for your accessibility statement and link it from the footer component so it appears everywhere.',
    faqs: [
      { q: 'Is a Framer site ADA compliant?', a: 'Framer supplies accessibility controls, but they only work if you use them. Scan the published site to see what remains.' },
      { q: 'Are animations an ADA problem?', a: 'Constant movement can be, and WCAG requires a way to pause moving content that lasts over five seconds. Respecting reduced-motion settings helps.' },
      { q: 'Can I scan a Framer site in preview?', a: 'AccessBell scans published public pages and, on Pro, staging sites.' },
    ],
  },
  ghost: {
    exposure: 'Ghost publications are content businesses: newsletters, memberships and blogs where the writers decide the accessibility of every post. ADA exposure on a Ghost site is about habits, such as alt text on every image and real headings, and about the signup and portal forms that turn readers into members.',
    risks: [
      { sc: '1.1.1', title: 'Image and gallery cards', text: 'Images and galleries added in the editor without alt text.' },
      { sc: '1.3.1', title: 'Headings in long posts', text: 'Bold text used for section titles, and levels that skip.' },
      { sc: '3.3.2', title: 'Subscribe and portal forms', text: 'Signup forms and pop-ups that need clear labels and error messages.' },
      { sc: '4.1.2', title: 'Embeds', text: 'Videos and social embeds in iframes without titles.' },
    ],
    steps: [
      'Give writers a short checklist: alt text for every image, real headings, descriptive links and captions on video.',
      'Scan the homepage, a post and the subscribe flow, since they use different theme templates.',
      'Fix colors and focus styles once in the theme so every post benefits.',
    ],
    statement: 'Publish your accessibility statement as a page and link it from the navigation or footer in the theme settings.',
    faqs: [
      { q: 'Is Ghost ADA compliant?', a: 'Ghost’s themes are a good base, but writers and theme edits decide the result. Scan a few posts and your signup pages.' },
      { q: 'Do paid newsletters need to be accessible?', a: 'If you sell memberships to the public, your site is part of a commercial service. Accessible signup and content protect readers and you.' },
      { q: 'Can AccessBell scan Ghost(Pro) sites?', a: 'Yes. Hosting makes no difference, since AccessBell tests the public pages.' },
    ],
  },
  kajabi: {
    exposure: 'Kajabi sells courses, memberships and coaching, which means most of the product is media. ADA risk includes the website, and also the video lessons, downloads and checkout that customers pay for. A caption-free course video is a barrier a customer has already paid for.',
    risks: [
      { sc: '1.2.2', title: 'Video lessons without captions', text: 'Lesson, sales-page and webinar videos with no captions or transcripts.' },
      { sc: '1.1.1', title: 'Sales pages built from images', text: 'Headlines, bonuses and pricing set as pictures with no text alternative.' },
      { sc: '3.3.2', title: 'Opt-in and checkout forms', text: 'Email capture and order forms with placeholders and unclear errors.' },
      { sc: '1.4.3', title: 'Low contrast in marketing sections', text: 'Colored buttons and fine print that fail contrast.' },
    ],
    steps: [
      'Upload captions for every lesson video, and review them for errors before publishing.',
      'Rebuild image-only sections of your sales page as real text.',
      'Test downloads such as workbooks with a PDF accessibility check before you attach them to a product.',
    ],
    statement: 'Publish a statement page and link it from your site footer and your member area, so students can ask for accessible materials.',
    faqs: [
      { q: 'Do my Kajabi courses need to be accessible?', a: 'Courses sold to the public are part of your commercial website and services. Captions and transcripts also help every student.' },
      { q: 'Can AccessBell scan my course lessons?', a: 'It scans public pages. Member-only lessons need a login, so check videos and downloads yourself.' },
      { q: 'What should I fix first on Kajabi?', a: 'Captions on videos, text in place of image text on sales pages, and form labels. These affect both access and sales.' },
    ],
  },
  elementor: {
    exposure: 'Elementor makes it easy to build a polished page in an afternoon, which is also how the same ADA gaps get copied across a whole site. A global heading setting, a form template or a color palette applied everywhere repeats any mistake in it everywhere.',
    risks: [
      { sc: '1.3.1', title: 'Heading widgets chosen for size', text: 'Heading tags picked by appearance, producing many h1s and skipped levels.' },
      { sc: '3.3.2', title: 'Forms with hidden labels', text: 'Form widgets set to show placeholders instead of labels.' },
      { sc: '4.1.2', title: 'Icon and image links', text: 'Icon boxes and image links with no text alternative.' },
      { sc: '2.2.2', title: 'Sliders, popups and animations', text: 'Autoplay carousels and entrance effects that cannot be paused.' },
    ],
    steps: [
      'Review global colors and fonts first, because one fix applies across the whole site.',
      'Fix the form widget and heading defaults in your templates, then re-scan a page built from each.',
      'Check popups built with the Popup Builder with a keyboard: they must take focus and close with Escape.',
    ],
    statement: 'Build your statement page in Elementor and link it from your footer template, so it is on every page.',
    faqs: [
      { q: 'Is Elementor ADA compliant?', a: 'Elementor provides the controls for accessible pages. Compliance depends on how you use them, so scan published pages.' },
      { q: 'Will an Elementor accessibility add-on make me compliant?', a: 'No add-on can fix every page. Fix headings, labels and contrast in the site, and treat toolbars as extras.' },
      { q: 'Which Elementor pages should I scan?', a: 'A page from each template: homepage, an inner page, a form page and a landing page.' },
    ],
  },
  divi: {
    exposure: 'Divi sites often start from purchased layout packs, so ADA issues arrive pre-installed: heading tags chosen for design, hover menus, placeholder forms and text over photos. A layout pack used across several pages repeats its issues on all of them.',
    risks: [
      { sc: '2.1.1', title: 'Hover-only dropdown menus', text: 'Menus that open on hover and cannot be reached with a keyboard.' },
      { sc: '3.3.2', title: 'Contact form placeholders', text: 'Contact Form modules that use field titles as placeholders.' },
      { sc: '1.3.1', title: 'Layout pack headings', text: 'Imported layouts with the wrong heading levels.' },
      { sc: '1.4.3', title: 'Text over hero images', text: 'Fullwidth headers with text on photos and light overlays.' },
    ],
    steps: [
      'Review every layout you imported, and fix headings, contrast and form labels at the module level.',
      'Test the main menu with Tab, Enter and Escape, and check the mobile menu too.',
      'Use a child theme or the theme options for global fixes, so updates do not undo them.',
    ],
    statement: 'Create a page for your accessibility statement and link it from the footer in the Theme Builder.',
    faqs: [
      { q: 'Is Divi ADA compliant?', a: 'Divi offers settings for accessible sites and its team is working on accessibility in Divi 5, but each site varies. Scan yours.' },
      { q: 'Do I need Divi accessibility plugins?', a: 'Some add keyboard menus and focus styles that help, but none guarantees compliance. Always test the result.' },
      { q: 'Will upgrading to Divi 5 fix my accessibility issues?', a: 'Not automatically. Rescan after upgrading to see what changed.' },
    ],
  },
  prestashop: {
    exposure: 'PrestaShop is widely used by merchants in Europe, where the European Accessibility Act now applies to online stores as well, and many of those merchants also serve US customers. A PrestaShop store is therefore exposed under more than one regime, and one WCAG-based record works for both.',
    risks: [
      { sc: '2.4.7', title: 'Purchased themes that remove focus', text: 'Commercial themes that restyle away the visible focus outline.' },
      { sc: '4.1.2', title: 'Faceted search and filters', text: 'Filters and sliders without names or announced results.' },
      { sc: '2.1.1', title: 'Mega menus', text: 'Module menus that open on hover and trap keyboard users.' },
      { sc: '3.3.1', title: 'One-page checkout modules', text: 'Checkout modules with unclear error messages and fields.' },
    ],
    steps: [
      'Restore a visible focus style and darken light text in your theme CSS.',
      'Test every module that changes the menu, filters or checkout with a keyboard.',
      'If you sell to EU consumers, read our guide to the European Accessibility Act and keep your scan records.',
    ],
    statement: 'Create a CMS page for your accessibility statement and link it in the footer, in each language your store serves.',
    faqs: [
      { q: 'Is a PrestaShop store ADA compliant?', a: 'The Classic theme is a reasonable base, but purchased themes and modules often undo it. Scan your store.' },
      { q: 'Does the EAA apply to my PrestaShop store?', a: 'If you sell to consumers in the EU, yes, wherever you are based, unless you qualify as a microenterprise providing services.' },
      { q: 'Will an accessibility module fix my store?', a: 'It may help some visitors, but it does not fix your theme or content. Fix the underlying issues.' },
    ],
  },
  nextjs: {
    exposure: 'Next.js sites are built by developers, often as product sites, SaaS marketing pages and stores, and they are usually fast and well made. ADA exposure on these sites comes from custom components and client-side behavior that build tools do not check: focus, announcements and page titles.',
    risks: [
      { sc: '2.4.2', title: 'Same title on every route', text: 'Client-side routes that do not set a unique page title.' },
      { sc: '4.1.2', title: 'Custom components', text: 'Dialogs, menus and dropdowns built from divs without roles and names.' },
      { sc: '3.1.1', title: 'Hard-coded page language', text: 'A missing or wrong lang attribute in the root layout.' },
      { sc: '4.1.3', title: 'Loading and error states', text: 'Content that appears after loading or submission without any announcement.' },
    ],
    steps: [
      'Set a unique title for every route and a correct lang value in the root layout.',
      'Replace custom controls with real buttons and links, or a tested component library.',
      'Add accessibility checks to CI, and scan each deployed preview and the live site.',
    ],
    statement: 'Add a statement route to your app and link it from the footer component, so it appears on every page.',
    faqs: [
      { q: 'Does Next.js make my site ADA compliant?', a: 'No framework does. Next.js has helpful defaults, but your components, content and styles decide the result.' },
      { q: 'Can a scanner test client-rendered pages?', a: 'Yes, if it runs the page in a browser. AccessBell does, and tests the rendered result.' },
      { q: 'How do I test preview deployments?', a: 'AccessBell Pro can scan staging and preview sites, including ones behind custom headers.' },
    ],
  },
  react: {
    exposure: 'React apps give developers total control, and that includes the freedom to build a button from a div. Single-page apps are also easy to ship without anyone testing with a keyboard or screen reader, which is where ADA problems in web apps usually start.',
    risks: [
      { sc: '4.1.2', title: 'Clickable divs', text: 'Elements with click handlers but no button or link semantics.' },
      { sc: '3.3.2', title: 'Inputs without labels', text: 'Fields with placeholders only, or labels that are not connected.' },
      { sc: '2.4.3', title: 'Focus after updates', text: 'Focus lost when a route changes or a modal opens or closes.' },
      { sc: '4.1.3', title: 'Silent updates', text: 'Results, toasts and errors that change without being announced.' },
    ],
    steps: [
      'Use native elements first, and test each custom component with a keyboard before shipping.',
      'Manage focus on purpose when dialogs open and routes change.',
      'Add accessibility linting and tests, and scan the deployed app as an independent check.',
    ],
    statement: 'Add an accessibility page to your app and link it from the footer or help menu, with a way to report problems.',
    faqs: [
      { q: 'Is React bad for accessibility?', a: 'No. React fully supports semantic HTML and ARIA. Problems come from how components are written.' },
      { q: 'Does ADA apply to web apps?', a: 'Web apps offered to the public to buy or use a service can be covered. Test the app like any other part of your website.' },
      { q: 'Can AccessBell scan an app behind a login?', a: 'The free scan covers public pages. Test logged-in flows by hand, and use staging scans where possible.' },
    ],
  },
  hostinger: {
    exposure: 'Hostinger runs both hosting and its own website builder, and its customers include many first-time business owners. A new owner using a template is exactly the combination ADA claims tend to find: a small site, quickly built, with no one checking it.',
    risks: [
      { sc: '1.1.1', title: 'Template and AI-generated images', text: 'Images added by a template or AI tool with no checked description.' },
      { sc: '1.4.3', title: 'Template color pairs', text: 'Pale colors and light text over photos.' },
      { sc: '3.3.2', title: 'Contact and booking forms', text: 'Forms with placeholders and unannounced errors.' },
      { sc: '2.2.2', title: 'Sliders and animations', text: 'Auto-advancing banners with no pause control.' },
    ],
    steps: [
      'Review any text or images generated for you, and edit descriptions so they are accurate.',
      'Check template colors against contrast, and change any that fail.',
      'Scan again after you change templates or add a plugin or an app, since each changes the markup.',
    ],
    statement: 'Add a page for your accessibility statement and link it in your footer or navigation.',
    faqs: [
      { q: 'Is a Hostinger website ADA compliant?', a: 'It depends on the template, builder or WordPress theme and on your content. The ADA scan shows the automated issues.' },
      { q: 'Does AI-generated content create accessibility problems?', a: 'It can, if images and text are published without review. Always check alt text and headings.' },
      { q: 'Is my small business site really at risk?', a: 'Small businesses are the usual targets: 64% of companies sued in the first half of 2025 had revenue under $25 million.' },
    ],
  },
  'wp-engine': {
    exposure: 'WP Engine hosts agency-built and enterprise WordPress sites, which usually have custom themes, a staging process and several people publishing. That is a strong setup for ADA compliance, but only if staging is used to test accessibility before launch, rather than just speed and security.',
    risks: [
      { sc: '2.4.1', title: 'Custom themes without skip links', text: 'Agency themes that omit landmarks and skip links.' },
      { sc: '1.1.1', title: 'Block and builder images', text: 'Cover blocks and galleries inserted without alt text.' },
      { sc: '3.3.2', title: 'Plugin forms', text: 'Form and search plugins with unlabeled fields.' },
      { sc: '4.1.2', title: 'Headless front ends', text: 'JavaScript front ends with custom components and no roles.' },
    ],
    steps: [
      'Add an ADA scan to your release checklist, run on staging before each deploy.',
      'Clear the page and CDN caches after fixes, then rescan the live page to confirm.',
      'Agencies should keep a dated record per client site, to show the work done.',
    ],
    statement: 'Publish a statement page and link it in the footer menu of every site, with the standard you follow and a contact for feedback.',
    faqs: [
      { q: 'Does WP Engine provide ADA compliance?', a: 'WP Engine manages performance and security. Accessibility depends on your theme, content and plugins.' },
      { q: 'Can I scan a WP Engine staging site?', a: 'Yes. AccessBell Pro can scan staging sites, including ones behind custom headers.' },
      { q: 'How do agencies prove they tested?', a: 'Dated scan records and a log of fixes, such as those in the Compliance Vault, show what was tested and when.' },
    ],
  },
  teachable: {
    exposure: 'Teachable schools sell education, and educational content is held to a high standard of access. The public school and sales pages are part of your commercial website, and the lessons themselves are something customers pay for, so captions and accessible downloads matter as much as the page code.',
    risks: [
      { sc: '1.2.2', title: 'Video lessons without captions', text: 'Lessons and promo videos with no accurate captions.' },
      { sc: '1.1.1', title: 'Sales pages built from images', text: 'Pricing and benefits set as images with no text alternative.' },
      { sc: '1.4.3', title: 'Low-contrast brand colors', text: 'Buttons and small print that fail contrast.' },
      { sc: '3.3.2', title: 'Enrollment and checkout forms', text: 'Forms with placeholders and unclear errors.' },
    ],
    steps: [
      'Review captions on every lesson video before publishing.',
      'Rebuild image-only pricing and benefit sections as real text.',
      'Run each downloadable PDF through a PDF accessibility check before attaching it.',
    ],
    statement: 'Publish a statement page on your school and link it from the footer and course player so students can request accessible materials.',
    faqs: [
      { q: 'Do online course sellers need ADA compliance?', a: 'Courses sold to the public are part of your commercial services. Accessible lessons also reach more customers.' },
      { q: 'Can the scan check my lessons?', a: 'The scan tests public pages. Captions and member lessons need your own check.' },
      { q: 'Where do I start?', a: 'Scan your school’s home and sales pages, then fix captions and downloads.' },
    ],
  },
};
