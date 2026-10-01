/**
 * Programmatic SEO pages at /platforms/<slug>: the free scanner, framed for
 * one CMS or e-commerce platform, with platform-specific common issues.
 */
import { MORE_PLATFORMS } from './platforms-more';

export type Platform = {
  slug: string;
  name: string;
  /** Site builder or CMS (default), or a web host whose customers run many kinds of site. */
  kind?: 'builder' | 'host';
  /** Used to group platforms on the hub page and to choose related checkers. */
  group: 'ecommerce' | 'cms' | 'builder' | 'framework' | 'host';
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

const BASE_PLATFORMS: Platform[] = [
  {
    slug: 'wordpress-accessibility-checker',
    name: 'WordPress',
    group: 'cms',
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
    group: 'ecommerce',
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
    group: 'builder',
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
    group: 'builder',
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
    group: 'builder',
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
  {
    slug: 'ionos-accessibility-checker',
    name: 'IONOS',
    group: 'host',
    kind: 'host',
    seoTitle: 'Free IONOS Accessibility Checker',
    description: 'Free IONOS accessibility checker. Scan any site hosted on IONOS, whether built with its website builder or WordPress, for WCAG issues.',
    lead: 'Scan any website hosted on IONOS for real WCAG failures, whether you built it with the IONOS website builder, WordPress or your own code.',
    stat: {
      text: 'WebAIM’s annual analysis of the top one million home pages finds detectable WCAG failures on the vast majority of them, year after year, with low-contrast text, missing alternative text and missing form labels among the most common.',
      href: 'https://webaim.org/projects/million/',
      label: 'WebAIM Million',
    },
    whatIs: [
      'IONOS hosts a wide range of sites, from pages made with its own website builder to WordPress installs and fully custom code. The host does not decide how accessible your site is: the template, plugins, content and code you publish do.',
      'Because many IONOS customers run businesses in Europe, accessibility is also a legal question there. The European Accessibility Act has applied since 28 June 2025 to many businesses that sell products and services to consumers in the EU, including online shops.',
    ],
    commonIssues: [
      { title: 'Template color contrast', text: 'Builder templates and themes often use light gray text or pale buttons that fall below the 4.5:1 contrast WCAG requires for normal text.' },
      { title: 'Images without alt text', text: 'Photos added through a builder or media library are easy to publish without alternative text, so screen reader users miss what they show.' },
      { title: 'Contact and booking forms', text: 'Form widgets and plugins sometimes rely on placeholder text instead of visible labels, and do not announce errors to screen readers.' },
      { title: 'Cookie consent banners', text: 'Consent banners, common on EU sites, can trap keyboard focus or hide the rest of the page from screen readers until dismissed.' },
      { title: 'Headings used for styling', text: 'Text styled to look like a heading, or headings chosen for their size, leaves the page without a structure screen reader users can navigate.' },
    ],
    fixNotes: [
      'Fix recurring problems in the template, theme or global styles first, such as colors and heading styles, so every page benefits at once.',
      'Rescan after changing templates, installing plugins or adding new sections, since each change can introduce new issues.',
    ],
    faqs: [
      { q: 'Is my IONOS website accessible?', a: 'That depends on the site, not the hosting. Templates, plugins and the content you add decide how accessible it is. A free scan shows how many automated issues any page has in seconds.' },
      { q: 'Do I need to install anything on IONOS to scan my site?', a: 'No. AccessBell scans the live public page in a browser, the same way a visitor sees it. You do not need a plugin, a code snippet or your hosting login.' },
      { q: 'Does the European Accessibility Act apply to my IONOS site?', a: 'It may. Since 28 June 2025, the EAA applies to many businesses that sell certain products and services to consumers in the EU, including e-commerce, and it refers to the EN 301 549 standard. Micro-enterprises providing services are exempt. Check with a legal adviser for your situation.' },
    ],
    related: ['wcag-1-4-3-contrast-minimum', 'wcag-3-3-2-labels-or-instructions', 'automated-vs-manual-accessibility-testing'],
  },
  {
    slug: 'siteground-accessibility-checker',
    name: 'SiteGround',
    group: 'host',
    kind: 'host',
    seoTitle: 'Free SiteGround Accessibility Checker',
    description: 'Free SiteGround accessibility checker. Scan WordPress and WooCommerce sites hosted on SiteGround for WCAG failures in themes, plugins and checkout.',
    lead: 'Scan your SiteGround-hosted WordPress or WooCommerce site for real WCAG failures in the theme, page builder, plugins and checkout.',
    stat: {
      text: 'WebAIM’s annual analysis of the top one million home pages finds detectable WCAG failures on the vast majority of them, year after year, with low-contrast text, missing alternative text and missing form labels among the most common.',
      href: 'https://webaim.org/projects/million/',
      label: 'WebAIM Million',
    },
    whatIs: [
      'SiteGround is best known for managed WordPress and WooCommerce hosting. On a WordPress site, accessibility comes down to the theme, the page builder and every plugin that adds markup to the page, not the server it runs on.',
      'Hosting features can still affect what visitors get. Optimization settings that combine, delay or defer scripts can change how menus, sliders and pop-ups behave, so it is worth rescanning after you change them.',
    ],
    commonIssues: [
      { title: 'Page builder markup', text: 'Page builders often produce deeply nested layouts and text styled to look like headings, which leaves screen reader users without a usable page structure.' },
      { title: 'WooCommerce product and cart pages', text: 'Product galleries, quantity selectors and mini-carts are common sources of keyboard traps and unlabeled buttons.' },
      { title: 'Plugin forms', text: 'Contact, newsletter and booking forms from plugins frequently miss field labels or fail to announce errors.' },
      { title: 'Delayed or combined scripts', text: 'When scripts are delayed for speed, menus and dialogs can load late or lose their keyboard handling. Test them with a keyboard after changing optimization settings.' },
      { title: 'Low-contrast theme colors', text: 'Many themes ship light gray body text and pale buttons that fail WCAG contrast.' },
    ],
    fixNotes: [
      'Fix issues in the theme and reusable blocks first, then work through plugins one by one. Replace plugins that cannot be fixed.',
      'Rescan after theme, plugin and optimization changes. A passing scan today does not mean the next update will not break something.',
    ],
    faqs: [
      { q: 'Is SiteGround hosting accessible?', a: 'Hosting does not make a website accessible or inaccessible. On SiteGround, as anywhere, the theme, plugins and content decide the result.' },
      { q: 'Can AccessBell scan a WordPress site on SiteGround?', a: 'Yes. It loads your live page in a real Chrome browser and tests what WordPress, your theme and your plugins actually render.' },
      { q: 'Do caching and speed settings affect accessibility?', a: 'They can. Settings that delay or combine JavaScript can change how interactive parts of the page behave. Scan and test with a keyboard after changing them.' },
    ],
    related: ['wcag-1-4-3-contrast-minimum', 'wcag-2-2-2-pause-stop-hide', 'free-tools-to-check-website-accessibility'],
  },
  {
    slug: 'bluehost-accessibility-checker',
    name: 'Bluehost',
    group: 'host',
    kind: 'host',
    seoTitle: 'Free Bluehost Accessibility Checker',
    description: 'Free Bluehost accessibility checker. Scan WordPress sites hosted on Bluehost for WCAG failures in themes, plugins, forms and content.',
    lead: 'Scan your Bluehost-hosted WordPress site for real WCAG failures in the theme, plugins, forms and content, and see how to fix each one.',
    stat: {
      text: 'WebAIM’s annual analysis of the top one million home pages finds detectable WCAG failures on the vast majority of them, year after year, with low-contrast text, missing alternative text and missing form labels among the most common.',
      href: 'https://webaim.org/projects/million/',
      label: 'WebAIM Million',
    },
    whatIs: [
      'Bluehost is a popular host for WordPress sites. The accessibility of a WordPress site depends on the theme, the plugins and the content added to it, not on the hosting account.',
      'New WordPress sites often start with a starter theme, demo content and a set of preinstalled plugins. Review what came with your install, remove what you do not use, and check the rest.',
    ],
    commonIssues: [
      { title: 'Starter themes and demo content', text: 'Placeholder images without alt text, sample pages and demo sections can stay live long after launch.' },
      { title: 'Low-contrast colors', text: 'Theme color settings often produce light text or buttons that fail WCAG contrast minimums.' },
      { title: 'Unlabeled form fields', text: 'Contact and signup forms that use placeholder text instead of labels are hard to use with a screen reader.' },
      { title: 'Empty links and buttons', text: 'Social icons, cart icons and search buttons without text alternatives are announced as just "link" or "button".' },
      { title: 'Sliders and pop-ups', text: 'Auto-rotating sliders without a pause button and pop-ups that trap keyboard focus are common in WordPress themes.' },
    ],
    fixNotes: [
      'Remove unused plugins, sample pages and demo content, then fix colors and headings in the theme settings so the changes apply site-wide.',
      'Add alt text in the media library and give icon links and buttons a text label.',
    ],
    faqs: [
      { q: 'Is my Bluehost WordPress site accessible?', a: 'Not automatically. The theme, plugins and content decide how accessible it is. A free scan shows how many automated issues any page has.' },
      { q: 'Do I need a plugin to check accessibility on Bluehost?', a: 'No. AccessBell scans the live page in a browser, so there is nothing to install on your hosting account or WordPress site.' },
      { q: 'Will an accessibility plugin make my site compliant?', a: 'Not on its own. Overlay widgets do not change your site’s code. Plugins that fix markup can help with some site-wide issues, but content and plugin output still need fixing directly.' },
    ],
    related: ['wcag-1-1-1-non-text-content', 'wcag-3-3-2-labels-or-instructions', 'accessibe-alternative'],
  },
  {
    slug: 'hosting-com-accessibility-checker',
    name: 'Hosting.com',
    group: 'host',
    kind: 'host',
    seoTitle: 'Free Hosting.com Accessibility Checker',
    description: 'Free Hosting.com accessibility checker. Scan any site hosted on Hosting.com, WordPress or custom, for WCAG failures and see how many issues it has.',
    lead: 'Scan any website hosted on Hosting.com, from WordPress to custom code, for real WCAG failures and a clear fix for each one.',
    stat: {
      text: 'WebAIM’s annual analysis of the top one million home pages finds detectable WCAG failures on the vast majority of them, year after year, with low-contrast text, missing alternative text and missing form labels among the most common.',
      href: 'https://webaim.org/projects/million/',
      label: 'WebAIM Million',
    },
    whatIs: [
      'Hosting.com hosts everything from WordPress sites to custom applications. Whatever you run, accessibility is decided by the code, templates and content you publish, not the hosting plan underneath.',
      'That makes a regular scan useful whatever your stack: it tests the finished page your visitors actually receive.',
    ],
    commonIssues: [
      { title: 'Missing text alternatives', text: 'Images, icons and image links published without alt text or accessible names.' },
      { title: 'Color contrast', text: 'Text and buttons with too little contrast against their background, often from theme or brand colors.' },
      { title: 'Form accessibility', text: 'Fields without visible labels, and errors that are shown only in color or never announced.' },
      { title: 'Keyboard access', text: 'Menus, dialogs and custom widgets that cannot be reached or closed with a keyboard.' },
      { title: 'Page structure', text: 'Missing page language, skipped heading levels and missing landmarks that make pages hard to navigate with a screen reader.' },
    ],
    fixNotes: [
      'Fix issues at the source: in the template, component or theme that produces them, so every page that uses it is fixed together.',
      'Add scans to your release routine, so new issues are caught before they reach visitors.',
    ],
    faqs: [
      { q: 'Is my Hosting.com website accessible?', a: 'That depends on the site you publish. The hosting plan does not change your HTML, so the templates, code and content decide how accessible it is.' },
      { q: 'Can AccessBell scan custom-built sites on Hosting.com?', a: 'Yes. AccessBell scans any public page in a real browser, whatever framework, CMS or code produced it.' },
      { q: 'Can I scan a staging site?', a: 'The free scan checks public pages. AccessBell Pro can scan staging and protected pages using custom HTTP headers.' },
    ],
    related: ['automated-vs-manual-accessibility-testing', 'keyboard-accessibility-testing', 'wcag-1-1-1-non-text-content'],
  },
  {
    slug: 'godaddy-accessibility-checker',
    name: 'GoDaddy',
    group: 'host',
    kind: 'host',
    seoTitle: 'Free GoDaddy Accessibility Checker',
    description: 'Free GoDaddy accessibility checker. Scan sites built with GoDaddy Websites + Marketing or WordPress on GoDaddy for WCAG failures.',
    lead: 'Scan your GoDaddy site, whether it is built with Websites + Marketing or WordPress, for real WCAG failures and how to fix each one.',
    stat: {
      text: 'WebAIM’s annual analysis of the top one million home pages finds detectable WCAG failures on the vast majority of them, year after year, with low-contrast text, missing alternative text and missing form labels among the most common.',
      href: 'https://webaim.org/projects/million/',
      label: 'WebAIM Million',
    },
    whatIs: [
      'GoDaddy customers run sites built with its Websites + Marketing builder as well as WordPress and other software. In each case, the template, sections and content you choose decide how accessible the site is.',
      'Site builders make it quick to add sections such as galleries, booking forms and online store pages. Each one is worth checking, because a single section with a problem appears on every page that uses it.',
    ],
    commonIssues: [
      { title: 'Images without alt text', text: 'Images added to builder sections and galleries are easy to publish without describing them.' },
      { title: 'Section color contrast', text: 'Text placed over images or colored section backgrounds often lacks enough contrast.' },
      { title: 'Booking and contact forms', text: 'Forms need visible labels and clear error messages that screen readers announce.' },
      { title: 'Online store pages', text: 'Product options, cart buttons and quantity controls need accessible names and keyboard support.' },
      { title: 'Link text', text: 'Buttons and links such as "Learn more" repeated across sections do not say where they go.' },
    ],
    fixNotes: [
      'Add alt text to every informative image, and check text over images and colored backgrounds for contrast.',
      'Rename vague buttons, such as "Learn more", to say what they lead to, such as "Learn more about our services".',
    ],
    faqs: [
      { q: 'Is the GoDaddy website builder accessible?', a: 'A builder provides templates and sections, but the result depends on your content and design choices, such as alt text, colors and link wording. Scan your published pages to check.' },
      { q: 'Do I need to change anything in my GoDaddy account to scan my site?', a: 'No. AccessBell scans the live public page like a visitor. No plugin, code or account access is needed.' },
      { q: 'Can I check my GoDaddy online store?', a: 'Yes. Scan your home page, a product page, the cart and any other public pages to find issues in the parts of the store customers use most.' },
    ],
    related: ['wcag-1-1-1-non-text-content', 'wcag-1-4-3-contrast-minimum', 'ada-website-compliance-guide'],
  },
  {
    slug: 'hostgator-accessibility-checker',
    name: 'HostGator',
    group: 'host',
    kind: 'host',
    seoTitle: 'Free HostGator Accessibility Checker',
    description: 'Free HostGator accessibility checker. Scan WordPress and other sites hosted on HostGator for WCAG failures, from contrast to forms.',
    lead: 'Scan your HostGator-hosted site, WordPress or otherwise, for real WCAG failures, from low contrast to unlabeled forms, with a fix for each.',
    stat: {
      text: 'WebAIM’s annual analysis of the top one million home pages finds detectable WCAG failures on the vast majority of them, year after year, with low-contrast text, missing alternative text and missing form labels among the most common.',
      href: 'https://webaim.org/projects/million/',
      label: 'WebAIM Million',
    },
    whatIs: [
      'HostGator hosts many small business and personal sites, often running WordPress. Accessibility comes from the theme, plugins and content on the site, not the hosting plan.',
      'Small business sites tend to share the same trouble spots: a contact form, a gallery, a map and a few social icons. Checking those well covers a lot of ground.',
    ],
    commonIssues: [
      { title: 'Contact forms', text: 'Missing labels and errors that are not announced make forms hard to complete with a screen reader.' },
      { title: 'Social and icon links', text: 'Icon-only links without accessible names are read out as just "link".' },
      { title: 'Embedded maps and videos', text: 'Embeds without titles, and videos without captions, leave out screen reader and deaf users.' },
      { title: 'Image galleries', text: 'Gallery images without alt text, and lightboxes that trap keyboard focus.' },
      { title: 'Low-contrast text', text: 'Light gray text and pale buttons from theme defaults.' },
    ],
    fixNotes: [
      'Give every icon link and embedded frame a clear text name, and add captions to videos.',
      'Fix theme-level colors and fonts first, then check each plugin that adds a form, gallery or embed.',
    ],
    faqs: [
      { q: 'Is my HostGator website accessible?', a: 'Not automatically. The theme, plugins and content you use decide that. Run a free scan to see how many automated issues any page has.' },
      { q: 'Do I need to install anything on HostGator?', a: 'No. AccessBell scans the live page in a browser, so nothing needs to be installed on your hosting account or site.' },
      { q: 'What should I check by hand after a scan?', a: 'Use the keyboard to move through menus, forms and pop-ups, and check that images, links and buttons make sense when read aloud. Our testing guides explain how.' },
    ],
    related: ['keyboard-accessibility-testing', 'wcag-1-1-1-non-text-content', 'free-tools-to-check-website-accessibility'],
  },
  {
    slug: 'dreamhost-accessibility-checker',
    name: 'DreamHost',
    group: 'host',
    kind: 'host',
    seoTitle: 'Free DreamHost Accessibility Checker',
    description: 'Free DreamHost accessibility checker. Scan WordPress and other sites hosted on DreamHost for WCAG failures in themes, plugins and content.',
    lead: 'Scan your DreamHost-hosted WordPress or custom site for real WCAG failures in the theme, plugins and content, with a fix for each one.',
    stat: {
      text: 'WebAIM’s annual analysis of the top one million home pages finds detectable WCAG failures on the vast majority of them, year after year, with low-contrast text, missing alternative text and missing form labels among the most common.',
      href: 'https://webaim.org/projects/million/',
      label: 'WebAIM Million',
    },
    whatIs: [
      'DreamHost hosts WordPress sites as well as custom and static sites. For every one of them, accessibility is decided by the code, theme, plugins and content, not by the host.',
      'Blogs and content-heavy sites have their own common gaps: images without alt text, long posts with no heading structure and links that just say "read more".',
    ],
    commonIssues: [
      { title: 'Blog images', text: 'Featured images and in-post images published without alt text.' },
      { title: 'Heading structure', text: 'Long posts that skip heading levels or use bold text instead of headings.' },
      { title: 'Vague link text', text: 'Repeated "read more" and "click here" links that do not say where they go.' },
      { title: 'Theme contrast', text: 'Light gray meta text, captions and buttons that fail WCAG contrast.' },
      { title: 'Comment and search forms', text: 'Fields without labels and buttons without accessible names.' },
    ],
    fixNotes: [
      'Set up your editor workflow so every post gets alt text, real headings and descriptive link text before it is published.',
      'Fix theme colors and form markup once, in the theme or a child theme, so every page benefits.',
    ],
    faqs: [
      { q: 'Is my DreamHost site accessible?', a: 'That depends on the site, not the hosting. Your theme, plugins and content decide how accessible it is. A free scan shows how many automated issues a page has.' },
      { q: 'Can AccessBell scan a static site hosted on DreamHost?', a: 'Yes. AccessBell scans any public page in a real browser, however it was built.' },
      { q: 'How often should I scan a blog?', a: 'Scan after theme and plugin changes, and regularly as you publish. AccessBell Pro rescans up to 500 pages per domain every day and alerts you to new issues.' },
    ],
    related: ['wcag-1-1-1-non-text-content', 'wcag-1-3-2-meaningful-sequence', 'seo-audit'],
  },
];

export const PLATFORMS: Platform[] = [...BASE_PLATFORMS, ...MORE_PLATFORMS];

export const platformPath = (p: Platform) => `/platforms/${p.slug}`;
