/**
 * Programmatic SEO pages at /platforms/<slug>: the free scanner, framed for
 * one CMS or e-commerce platform, with platform-specific common issues.
 */
export type Platform = {
  slug: string;
  name: string;
  seoTitle: string;
  description: string;
  lead: string;
  stat: { text: string; href: string; label: string };
  whatIs: string[];
  commonIssues: { title: string; text: string }[];
  fixNotes: string[];
  faqs: { q: string; a: string }[];
  related: string[];
};

export const PLATFORMS: Platform[] = [
  {
    slug: 'wordpress-accessibility-checker',
    name: 'WordPress',
    seoTitle: 'Free WordPress Accessibility Checker',
    description: 'Free WordPress accessibility checker. Scan your site for the plugin, theme and page-builder issues that most often break WCAG compliance.',
    lead: 'Scan any WordPress site for real WCAG failures, including the page-builder and plugin issues that generic accessibility overlays never fix.',
    stat: {
      text: 'WordPress powers a large share of the sites in WebAIM’s annual accessibility survey of the top million home pages, and page builders and third-party plugins, not WordPress core, are the most consistently cited source of failures.',
      href: 'https://webaim.org/projects/million/2025',
      label: 'WebAIM Million 2025',
    },
    whatIs: [
      'WordPress core ships reasonably accessible default markup, but almost no WordPress site runs on core alone. Page builders, form plugins, galleries and cookie banners each add their own HTML, and any one of them can break accessibility that the theme got right.',
      'That is why two WordPress sites built on the same theme can have very different results: the gap is almost always in the plugins and builder blocks layered on top, not the underlying platform.',
    ],
    commonIssues: [
      { title: 'Page builder markup', text: 'Elementor, Divi and WPBakery generate deeply nested, non-semantic divs and often style text to look like a heading without using a real heading tag, so screen readers cannot find the page structure.' },
      { title: 'Contact form errors', text: 'Contact Form 7 and similar plugins frequently ship with missing field labels or error messages that are not announced to screen readers when a submission fails.' },
      { title: 'WooCommerce galleries and carts', text: 'Product image galleries and cart interactions commonly trap keyboard focus, blocking anyone who cannot use a mouse from completing a purchase.' },
      { title: 'Cookie banners', text: 'Consent banners are a common source of keyboard traps, especially when they load after the page and grab focus without a way to close them by keyboard.' },
      { title: 'Decorative icons and sliders', text: 'Icon fonts and image sliders frequently expose decorative graphics to screen readers as unlabeled content, and carousels often ignore focus and pause controls.' },
    ],
    fixNotes: [
      'An accessibility-enhancer plugin (one that changes the markup your site outputs, not an overlay widget) can fix some site-wide issues quickly, but it will not fix custom page-builder sections or a specific plugin’s broken markup.',
      'Scan after every theme update, plugin update and page-builder change; a passing scan today does not mean a plugin update next month will not reintroduce an issue.',
    ],
    faqs: [
      { q: 'Is WordPress itself accessible?', a: 'WordPress core and the default block themes are built with reasonable accessibility in mind. Most real-world issues come from page builders, plugins and custom theme code added on top, not WordPress itself.' },
      { q: 'Will an accessibility plugin make my WordPress site compliant?', a: 'An overlay-style widget will not; it runs in the browser and does not change your site’s code. A plugin that actually modifies your markup can help with some site-wide issues, but page-builder sections and custom plugin output still need to be fixed directly.' },
      { q: 'Does AccessBell work with WordPress?', a: 'Yes. AccessBell scans the live, rendered page in a real Chrome browser, the same page your visitors see, regardless of which theme, builder or plugins generated it.' },
    ],
    related: ['free-tools-to-check-website-accessibility', 'automated-vs-manual-accessibility-testing', 'accessibe-alternative'],
  },
  {
    slug: 'shopify-accessibility-checker',
    name: 'Shopify',
    seoTitle: 'Free Shopify Accessibility Checker',
    description: 'Free Shopify accessibility checker. Test your storefront for WCAG failures in themes, apps and checkout before they cost you sales or a lawsuit.',
    lead: 'Scan your Shopify storefront for real WCAG failures, including the theme, app and checkout issues that most often go unnoticed until a customer complains.',
    stat: {
      text: 'In WebAIM’s 2025 Million report, Shopify home pages averaged 69.6 detected accessibility errors, 36.6% above the overall sample average of 51 errors per page.',
      href: 'https://webaim.org/projects/million/2025',
      label: 'WebAIM Million 2025',
    },
    whatIs: [
      'Even Shopify’s own free Dawn theme ships with accessibility issues out of the box, and every app you install adds third-party code that Shopify does not audit for accessibility, keyboard traps or screen reader compatibility.',
      'For a store with hundreds of products, small issues multiply fast: missing alt text on product images alone can mean thousands of individual failures across a catalog.',
    ],
    commonIssues: [
      { title: 'Missing or generic product alt text', text: 'Alt text failures are consistently the single most common issue on e-commerce sites; a store with 500 products and 4 images each has 2,000 separate places it can go wrong.' },
      { title: 'Keyboard traps in cart and checkout', text: 'Customers who cannot use a mouse are frequently unable to complete a purchase because the cart drawer or checkout flow does not support keyboard navigation.' },
      { title: 'Broken heading structure on collection pages', text: 'Product collection and category pages often skip heading levels or use styled text instead of real headings, confusing screen reader navigation.' },
      { title: 'Unaudited third-party apps', text: 'Reviews, upsell, chat and marketing apps inject their own HTML and JavaScript that can silently break keyboard access or screen reader labeling on every page they run on.' },
      { title: 'Mobile menu apps', text: 'Apps that replace Shopify’s default navigation with a custom mobile menu often lose the keyboard and screen reader support the original theme had.' },
    ],
    fixNotes: [
      'Rescan after every theme change and every app install; Shopify does not vet apps for accessibility, so a single new app can undo fixes you already made.',
      'Prioritize checkout and cart issues first: they block revenue directly and are the most common trigger for a demand letter in e-commerce.',
    ],
    faqs: [
      { q: 'Is Shopify accessible by default?', a: 'Shopify’s own themes are a reasonable starting point, but WebAIM’s research found Shopify home pages average significantly more accessibility errors than the overall web. Most issues come from theme customization and installed apps, not the Shopify platform itself.' },
      { q: 'Which Shopify accessibility issue should I fix first?', a: 'Cart and checkout keyboard traps first, since they block purchases directly, followed by missing product image alt text, which is usually the highest-volume issue on a catalog site.' },
      { q: 'Do accessibility apps in the Shopify App Store fix this?', a: 'Overlay-style apps run in the browser and do not change your store’s underlying code. A real scan that shows you the failing markup, and a developer fix in your theme, resolves the issue permanently.' },
    ],
    related: ['ada-website-compliance-guide', 'accessibe-alternative', 'userway-alternative'],
  },
  {
    slug: 'webflow-accessibility-checker',
    name: 'Webflow',
    seoTitle: 'Free Webflow Accessibility Checker',
    description: 'Free Webflow accessibility checker. Webflow gives you the tools to build accessible sites; scan to confirm your build actually used them correctly.',
    lead: 'Scan your published Webflow site to confirm the accessible foundation Webflow gives you was actually used correctly in your build.',
    stat: {
      text: 'Webflow outputs proper semantic HTML, including heading, nav, main and landmark elements, when the correct element types are chosen in the Designer, and every image has a built-in alt text field. Most Webflow sites still fall short of full compliance, not because the platform is inaccessible, but because those choices are easy to skip during a build.',
      href: 'https://webflow.com/accessibility',
      label: 'Webflow’s own accessibility documentation',
    },
    whatIs: [
      'Webflow is unusual among website builders in that it gives designers direct control over the underlying HTML: you can assign real heading levels, landmark elements and ARIA attributes in the visual Designer, and Webflow supports :focus-visible styling out of the box.',
      'The gap is almost always in how that control gets used. A div styled to look like a heading, an image imported without its alt text field filled in, or a custom interaction that steals keyboard focus will pass visually and fail an audit.',
    ],
    commonIssues: [
      { title: 'Styled divs instead of real headings', text: 'Text boxes styled with heading-sized fonts, instead of an actual Heading element, look identical visually but are invisible to screen reader navigation.' },
      { title: 'Empty alt text fields', text: 'Webflow prompts for alt text on every image, but it is optional, and images imported or duplicated quickly often keep it blank.' },
      { title: 'Custom interactions and animations', text: 'Webflow’s interactions panel makes it easy to build scroll and click animations that move focus unpredictably or hide content from keyboard users.' },
      { title: 'Embedded custom code', text: 'Custom code embeds and third-party widgets (booking tools, chat, video players) bring their own accessibility issues that Webflow’s Designer has no control over.' },
      { title: 'Color contrast in the style guide', text: 'Brand color palettes chosen for visual design are not automatically checked against WCAG contrast ratios anywhere in the Designer.' },
    ],
    fixNotes: [
      'Most fixes in Webflow are quick: swap a styled div for the correct Heading element, or fill in a missing alt text field, directly in the Designer.',
      'Scan the published site, not just the Designer preview, since custom code and third-party embeds only run on the live page.',
    ],
    faqs: [
      { q: 'Is Webflow accessible?', a: 'Webflow gives you the tools to build an accessible site: real semantic HTML, alt text fields, and focus-visible support. Whether a specific site is accessible depends on whether those tools were used correctly during the build.' },
      { q: 'Does Webflow have a built-in accessibility checker?', a: 'Webflow’s Designer does not run a full WCAG audit. A separate scan of the published site, checked against real WCAG success criteria, is needed to know what actually passes.' },
      { q: 'What should I check first on a Webflow site?', a: 'Heading structure (real Heading elements, not styled text) and alt text on images are the fastest, highest-impact fixes, since Webflow already gives you the fields to do both correctly.' },
    ],
    related: ['what-is-a-website-accessibility-checker', 'automated-vs-manual-accessibility-testing', 'wcag-2-2-checklist'],
  },
  {
    slug: 'squarespace-accessibility-checker',
    name: 'Squarespace',
    seoTitle: 'Free Squarespace Accessibility Checker',
    description: 'Free Squarespace accessibility checker. Squarespace does not guarantee WCAG compliance out of the box; scan your site to see what still needs fixing.',
    lead: 'Scan your Squarespace site to see what still needs fixing beyond the built-in templates, including the contrast, heading and link issues that show up most.',
    stat: {
      text: 'Squarespace’s design tools are strong, but the platform does not guarantee WCAG compliance out of the box; reaching WCAG 2.2 requires actively implementing specific adjustments most templates do not apply by default.',
      href: 'https://avp.io/guides/squarespace-accessibility',
      label: 'independent Squarespace accessibility guide',
    },
    whatIs: [
      'Squarespace templates are visually polished, but their default styling often prioritizes look over contrast, and content blocks give editors a lot of freedom to skip the accessibility basics without realizing it.',
      'Because most Squarespace sites are edited by non-developers, small habits, like sizing text visually instead of choosing the right heading level, are common and easy to miss without a scan.',
    ],
    commonIssues: [
      { title: 'Low-contrast default styling', text: 'Several default template styles use light, low-contrast text that fails WCAG’s minimum contrast ratio, especially for secondary text and buttons.' },
      { title: 'Missing image alt text', text: 'Gallery and summary blocks make it easy to add images quickly, and just as easy to skip the alt text field while doing it.' },
      { title: 'Heading levels skipped', text: 'Editors often size text visually to "look like a heading" rather than choosing the correct heading level, which breaks the page structure screen readers rely on.' },
      { title: 'Vague link text', text: '"Read more" and "Click here" links, common in Squarespace’s blog and summary blocks, are not descriptive out of context for screen reader users scanning a page’s links.' },
      { title: 'Custom code injections', text: 'Code blocks and embedded third-party widgets bypass Squarespace’s own markup and can introduce issues the platform has no control over.' },
    ],
    fixNotes: [
      'Most fixes are content edits, not code changes: correct heading levels, fill in alt text, and rewrite generic link text, all inside the Squarespace editor.',
      'Check custom CSS and code blocks separately, since they are the parts of the site Squarespace’s own defaults cannot help with.',
    ],
    faqs: [
      { q: 'Is Squarespace accessible?', a: 'Squarespace provides solid design tools, but does not guarantee WCAG compliance automatically. Reaching compliance still requires deliberate choices, like correct heading levels and sufficient contrast, that the templates do not enforce.' },
      { q: 'Do I need a developer to fix Squarespace accessibility issues?', a: 'Most common issues, contrast, alt text, heading levels and link text, can be fixed directly in the Squarespace editor without code. Custom code blocks and third-party embeds may need a developer.' },
      { q: 'Which Squarespace template is most accessible?', a: 'Accessibility depends more on how a template is used than which one you pick. Any template can fail on contrast, headings or alt text depending on the content added to it, so scanning the finished site matters more than the template choice.' },
    ],
    related: ['what-is-a-website-accessibility-checker', 'wcag-2-2-checklist', 'free-tools-to-check-website-accessibility'],
  },
  {
    slug: 'wix-accessibility-checker',
    name: 'Wix',
    seoTitle: 'Free Wix Accessibility Checker',
    description: 'Free Wix accessibility checker. Wix’s built-in accessibility wizard is a starting point, not a guarantee; scan your site to see what it missed.',
    lead: 'Scan your Wix site to see what its built-in accessibility wizard did not catch, from custom apps to contrast and alt text.',
    stat: {
      text: 'Wix includes a built-in accessibility wizard, which is a genuinely useful starting point, but does not guarantee full compliance on its own; real accessibility still requires manual review, testing and ongoing monitoring.',
      href: 'https://www.lowcodewebsite.com/post/wix-accessibility-complete-guide-to-fix-issues-achieve-ada-compliance-2026',
      label: 'independent Wix accessibility guide',
    },
    whatIs: [
      'Wix is one of the few site builders with a dedicated accessibility tool built into the editor, which is a real advantage over platforms with no guidance at all. It is best understood as a checklist and starting point, not a certification.',
      'The wizard cannot see everything: custom apps from the Wix App Market, embedded widgets and elements built with generic containers instead of real interactive elements all fall outside what it checks.',
    ],
    commonIssues: [
      { title: 'Generic div-based buttons', text: 'Elements styled to look like buttons but built from generic containers are often not operable by keyboard and are not announced as buttons to screen readers.' },
      { title: 'Contrast in custom color palettes', text: 'Custom brand colors applied to text and buttons are not automatically checked against WCAG contrast ratios by the editor.' },
      { title: 'Missing alt text', text: 'Images added through galleries or the media manager can be published without alt text if the field is left blank.' },
      { title: 'Third-party app widgets', text: 'Booking, chat, review and marketing apps from the Wix App Market bring their own code, which the accessibility wizard does not audit.' },
      { title: 'Custom interactions and animations', text: 'Scroll effects and custom animations can move focus unpredictably or hide content from keyboard users in ways the wizard does not catch.' },
    ],
    fixNotes: [
      'Run the built-in accessibility wizard first, then run a full scan; the two catch different things, and combining them covers more ground than either alone.',
      'Pay special attention to any third-party app you installed from the Wix App Market: those are outside what Wix’s own tools review.',
    ],
    faqs: [
      { q: 'Does Wix’s accessibility wizard make my site compliant?', a: 'It is a good starting point that checks for some common issues, but it does not guarantee full WCAG compliance, especially for third-party apps, custom code and custom interactions it was not built to review.' },
      { q: 'Is Wix accessible by default?', a: 'Wix gives you more built-in accessibility guidance than most site builders, but the final result still depends on the template, apps and content choices made on top of it.' },
      { q: 'What should I check beyond the Wix wizard?', a: 'Any third-party app from the Wix App Market, custom color contrast, and any custom interactions or animations, since these are the areas the built-in wizard does not fully cover.' },
    ],
    related: ['what-is-a-website-accessibility-checker', 'free-tools-to-check-website-accessibility', 'automated-vs-manual-accessibility-testing'],
  },
];

export const platformPath = (p: Platform) => `/platforms/${p.slug}`;
