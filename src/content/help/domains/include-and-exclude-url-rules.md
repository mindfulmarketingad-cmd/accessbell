---
title: 'Include and Exclude URL Rules'
description: 'Control which pages AccessBell discovers on your domain with simple include and exclude rules, using plain text or the * wildcard.'
order: 3
updatedDate: 2026-09-28
---

URL rules decide which pages **Find pages** keeps. Use them to focus on one section of a large site or to leave out pages you do not need, such as tag archives or search results.

Set them in the domain's **Settings** tab, one rule per line.

## Only Include URLs Matching

When this box has rules, only pages that match at least one rule are kept. Leave it empty to keep everything.

## Exclude URLs Matching

Pages that match any rule here are left out, even if they match an include rule.

## How Matching Works

- **Plain text** matches anywhere in the address. `blog` matches `https://example.com/blog/post` and `https://example.com/company-blog`.
- **The * wildcard** matches any characters, and the rule is compared with both the full address and the path. `/docs/*` matches every page under `/docs/`.
- Matching ignores upper and lower case.

## Examples

| Goal | Rule | Box |
| --- | --- | --- |
| Only the documentation section | `/docs/*` | Only include |
| Skip blog tag and author archives | `/blog/tag/*` and `/blog/author/*` | Exclude |
| Skip search result pages | `?s=` | Exclude |
| Skip a language version | `/fr/*` | Exclude |

Rules apply when pages are discovered. Pages you are already monitoring are not removed. Stop monitoring them in the Pages tab if you need to.
