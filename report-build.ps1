$ErrorActionPreference = 'Stop'
$workspace = 'C:\Users\nahoo\Desktop\paw-mate-frontend'
$tempRoot = 'C:\Users\nahoo\AppData\Local\Temp\paw-mate-design-report'
$reference = 'C:\Users\nahoo\.codex\plugins\cache\openai-curated-remote\openai-templates\0.1.1\skills\artifact-template-design-report\assets\reference.docx'
$package = Join-Path $tempRoot 'final-package'
$zipPath = Join-Path $tempRoot 'paw-mate-frontend-design-report.zip'
$final = Join-Path $workspace 'paw-mate-frontend-design-report.docx'

if (Test-Path $package) { Remove-Item -LiteralPath $package -Recurse -Force }
New-Item -ItemType Directory -Force -Path $package | Out-Null
Copy-Item -LiteralPath $reference -Destination (Join-Path $tempRoot 'working-reference.zip') -Force
Expand-Archive -LiteralPath (Join-Path $tempRoot 'working-reference.zip') -DestinationPath $package

$documentPath = Join-Path $package 'word\document.xml'
$xml = Get-Content -Raw -Encoding UTF8 $documentPath

$replacements = [ordered]@{
  'Report title' = 'Paw Mate frontend design report'
  'Short subtitle describing the report up to two lines of text' = 'UI consistency assessment of the current React frontend'
  'Prepared by [Author]' = 'Prepared for Product + Engineering'
  '[Month YYYY]' = 'September 2026'
  'Introduction' = 'Assessment approach'
  'Context and conditions' = 'Design foundation'
  'Patterns in the evidence' = 'Consistency gaps'
  'Conclusion' = 'Delivery sequence'
  'Notes' = 'Evidence and limitations'
  'Source placeholders' = 'Repository evidence'

  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.' = 'Paw Mate already has a recognizable product character: warm sage and apricot accents, generous radii, soft elevation, image-led animal cards, and parallel light and dark palettes. Shared layout components and CSS variables provide a credible foundation for a coherent adoption experience across public, account, review, and administrative surfaces. The strongest next step is not a visual redesign; it is consolidation. The current system expresses similar controls, widths, responsive thresholds, colors, and interaction states through many local implementations, which makes consistency harder to maintain as the product grows.'
  'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.' = 'The highest-priority issue observed in the production build is the page-state contract. Desktop and mobile captures of the home, animal-list, guide, and review routes remained on a darkened loading surface with a centered spinner while the header, footer, and mobile bottom navigation rendered. A slow or unavailable API can therefore make distinct routes look identically empty. Product and engineering should first guarantee bounded loading, route-level error and empty states, and a useful shell before investing in lower-impact polish.'
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.' = 'Strength: the global token layer defines color, typography, radii, shadows, motion, action roles, and dark-theme equivalents.'
  'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.' = 'Risk: 44 CSS files contain 52 max-width breakpoint rules across nine values and 73 distinct hexadecimal color literals, increasing visual drift.'
  'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.' = 'Priority: stabilize loading and failure behavior, then consolidate shared controls and responsive rules around a small documented UI contract.'
  'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.' = 'This assessment reviewed the repository at its 26 September 2026 state and built the Vite application successfully. Evidence came from the route map, global styles, 43 CSS modules, shared navigation and card components, accessibility markup, and local production captures at 1440-pixel desktop and 390-pixel mobile widths. The review focused on UI consistency: repeated visual roles, responsive behavior, navigation, focus and feedback states, and the relationship between shared tokens and local styling.'
  'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.' = 'The local captures are diagnostic rather than user research. They demonstrate what the built client renders when data requests do not settle in the capture window; they do not establish real-world frequency or backend root cause. Authenticated, populated, and administrator states were assessed from code structure only. Recommendations therefore emphasize observable interface contracts and maintainability, not unverified conversion or usability outcomes.'
  'Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.' = 'The interface is visually closer to a system than a collection of unrelated pages, but the system is implicit. Global tokens establish a warm, calm baseline; shared Header, BottomNav, Footer, AnimalCard, feedback, and modal components reinforce it. At the same time, page modules repeatedly define their own container widths, title scales, chips, badges, buttons, and breakpoints. Three themes determine the quality of the current experience: the strength of the foundation, the cost of local divergence, and the clarity of asynchronous states.'
  'Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur.' = 'The foundation is purposeful. The root stylesheet defines semantic action colors, surfaces, text tiers, borders, radii from 6 to 26 pixels, four elevation levels, motion tokens, focus-ring styling, and a complete dark palette. Shared layout widths cluster around 1200 pixels; animal imagery follows a stable 4:3 treatment; controls consistently favor rounded geometry and restrained shadows. The mobile drawer also demonstrates mature behavior: focus moves into the drawer, Tab is trapped, Escape closes it, focus returns to the trigger, and background regions become inert and aria-hidden. Reduced-motion handling exists globally, and the mobile bottom bar accounts for safe-area insets.'
  'Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat.' = 'Consistency weakens where roles are reimplemented locally. The stylesheet audit found nine max-width values—480, 520, 576, 600, 640, 768, 868, 900, and 1024 pixels—used across 52 rules. Navigation changes at 868 pixels while the bottom navigation and floating controls change at 768, creating an intermediate range that depends on several independent components remaining coordinated. Content containers use 600, 800, 900, 1000, 1200, and 1240-pixel maxima without a documented layout scale. Status colors in administrator modules introduce separate green, amber, indigo, red, and blue literals rather than consistently consuming semantic tokens. Only 14 of 44 CSS files contain explicit focus or focus-visible selectors, so keyboard emphasis depends unevenly on browser defaults and shared globals.'
  'Key takeaway.' = 'Key takeaway. '
  'At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti.' = 'Paw Mate does not need more stylistic variety. It needs fewer, clearer decisions for containers, breakpoints, buttons, chips, statuses, focus rings, and page states—implemented once and reused.'
  'Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit.' = 'The current divergence has two consequences. For users, the same conceptual action can change size, emphasis, hover behavior, or focus visibility between public and administrative screens. For delivery teams, each new page requires local judgment about width, breakpoint, status color, and component geometry, increasing review cost and regression risk. The unresolved loader is more acute: when data is slow or unavailable, the app preserves its chrome but removes page identity and recovery actions. That makes a technical dependency look like an undifferentiated product outage.'
  'Theme' = 'Theme'
  'Observation' = 'Observed evidence'
  'Implication' = 'Design implication'
  'Dolor sit amet' = 'Semantic light/dark tokens, shared radii and shadows, reusable layout components'
  'Consectetur adipiscing' = 'Preserve the visual language; formalize it as supported primitives and usage rules'
  'Sed do eiusmod' = '52 breakpoint rules across nine max-width values; navigation changes at 868 and 768 pixels'
  'Tempor incididunt' = 'Consolidate breakpoints and test the transitional widths as one coordinated shell'
  'Ut labore et dolore' = 'Multiple built routes remained on the same full-page spinner while chrome rendered'
  'Magna aliqua' = 'Bound loading time and provide route-specific error, empty, retry, and cached-content states'
  'Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae.' = 'Sequence the work from reliability to reuse. The first release should make every route intelligible under slow, empty, failed, and successful data conditions. The second should turn repeated visual roles into shared primitives. The third should enforce the contract through component examples, responsive tests, and accessibility checks.'
  'Clarify the objective. ' = 'Stabilize the page-state contract. '
  'Sequence the work. ' = 'Consolidate reusable UI decisions. '
  'Review the outcome. ' = 'Normalize responsive and accessible behavior. '
  'Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat.' = 'Phase 1—reliability: establish route-level loading, empty, error, and retry components; instrument time-to-content and error recovery; verify the shell in light and dark modes. Phase 2—systemization: publish container, type, control, state, and breakpoint primitives; migrate the home, animal list/detail, adoption form, reviews, account, and administration surfaces in that order. Phase 3—guardrails: add component examples, screenshot checks at the agreed widths, keyboard tests, and a lintable policy for raw color use.'
  'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.' = 'Success is a smaller set of reusable decisions and a more informative experience under failure—not visual novelty. Product should accept the work when core routes always communicate what is happening and what the user can do next. Engineering should accept it when new screens can be assembled from documented primitives without inventing widths, breakpoints, status colors, or focus behavior.'
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam.' = 'Rendered evidence: a production build completed successfully. Headless Edge captures were taken for /, /animals, /guide, and /reviews at 1440 × 1200, plus / and /animals at 390 × 844. In each capture, navigation and footer or bottom navigation rendered while the main area remained on a centered spinner over a darkened surface. This supports the page-state finding but does not identify whether the delay originates in configuration, network availability, authentication, or the API.'
  'Suspendisse potenti. Nunc feugiat mi a tellus consequat imperdiet. Vestibulum sapien. Proin quam. Etiam ultrices.' = 'Quantitative repository evidence: 44 CSS files, including 43 modules; 52 max-width media-query rules across nine distinct breakpoint values; 163 hexadecimal color usages representing 73 unique literals; and explicit focus-related selectors in 14 CSS files. These counts are indicators of consolidation opportunity, not quality scores. The source also contains positive accessibility patterns, including focus trapping, Escape handling, focus restoration, inert background content, ARIA labels, safe-area insets, and reduced-motion rules.'
  '[Author or organization]. [Source title]. [Publisher], [Year].' = 'Paw Mate repository. src/styles/global.css and 43 CSS modules. Snapshot reviewed 26 September 2026.'
  '[Author or organization]. [Report or article title]. [Month Year].' = 'Paw Mate repository. src/components/Header.tsx, BottomNav.tsx, Layout.tsx, and AnimalCard.tsx. Reviewed September 2026.'
  '[Dataset owner]. [Dataset name and version]. Accessed [Month Year].' = 'Paw Mate repository. src/App.tsx route map and package.json build configuration. Reviewed September 2026.'
  '[Interviewee or team]. [Interview or workshop notes]. [Date].' = 'Local production build and headless Edge captures at desktop and mobile widths. Captured 26 September 2026.'
  'Template note. ' = 'Scope note. '
  'Replace bracketed placeholders, update the table of contents, and confirm page references before publishing.' = 'No analytics, interviews, competitive review, or authenticated production data were supplied. Conclusions are limited to repository and local-render evidence; cached table-of-contents fields are configured to refresh when opened in Microsoft Word.'
}

foreach ($entry in $replacements.GetEnumerator()) {
  $old = [Security.SecurityElement]::Escape($entry.Key)
  $new = [Security.SecurityElement]::Escape($entry.Value)
  if (-not $xml.Contains($old)) {
    Write-Warning "Template text was already consumed by an earlier contextual replacement: $($entry.Key)"
    continue
  }
  $xml = $xml.Replace($old, $new)
}

$xml = $xml.Replace('<w:t xml:space="preserve">Lorem</w:t>', '<w:t xml:space="preserve">Foundation</w:t>')
$xml = $xml.Replace('<w:t xml:space="preserve">Ipsum</w:t>', '<w:t xml:space="preserve">Responsive system</w:t>')
$xml = $xml.Replace('<w:t xml:space="preserve">Dolor</w:t>', '<w:t xml:space="preserve">Page states</w:t>')

$riskText = [Security.SecurityElement]::Escape('Risk: 44 CSS files contain 52 max-width breakpoint rules across nine values and 73 distinct hexadecimal color literals, increasing visual drift.')
$loadingPlaceholder = [Security.SecurityElement]::Escape('Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.')
$loadingText = [Security.SecurityElement]::Escape('Give each route a bounded loading state, a route-specific failure message, a retry action, and an intentional empty state. Keep useful page identity visible during loading and avoid a full-surface dark overlay for ordinary fetches. Define when cached content remains visible and when blocking is justified. Add tests for slow, rejected, empty, and recovered requests on home, animals, guide, reviews, and authenticated routes.')
$consolidateText = [Security.SecurityElement]::Escape('Create shared primitives for page containers, headings, buttons, chips, status badges, form fields, cards, and feedback surfaces. Replace local color literals with semantic variables and document a small container scale. Preserve the current warm visual character while reducing one-off geometry. Start with high-frequency public surfaces, then align administrative variants without forcing unlike workflows into the same component.')
$priorityText = [Security.SecurityElement]::Escape('Priority: stabilize loading and failure behavior, then consolidate shared controls and responsive rules around a small documented UI contract.')
$responsiveText = [Security.SecurityElement]::Escape('Choose a minimal breakpoint set and make Header, mobile drawer, BottomNav, floating controls, and page padding consume it consistently. Define visible focus treatment for every interactive role, retain reduced-motion support, and add automated keyboard checks for drawers, modals, chips, pagination, favorites, and forms. Review 390, 768, 868, 1024, and 1440-pixel widths during migration to catch transitional regressions.')
$xml = [regex]::Replace($xml, '(<w:p w14:paraId="0000003A".*?</w:p>)', { param($m) $m.Value.Replace($loadingPlaceholder, $loadingText) }, [Text.RegularExpressions.RegexOptions]::Singleline)
$xml = [regex]::Replace($xml, '(<w:p w14:paraId="0000003B".*?</w:p>)', { param($m) $m.Value.Replace($riskText, $consolidateText) }, [Text.RegularExpressions.RegexOptions]::Singleline)
$xml = [regex]::Replace($xml, '(<w:p w14:paraId="0000003C".*?</w:p>)', { param($m) $m.Value.Replace($priorityText, $responsiveText) }, [Text.RegularExpressions.RegexOptions]::Singleline)

[IO.File]::WriteAllText($documentPath, $xml, [Text.UTF8Encoding]::new($false))

$settingsPath = Join-Path $package 'word\settings.xml'
$settings = Get-Content -Raw -Encoding UTF8 $settingsPath
if ($settings -notmatch '<w:updateFields') {
  $settings = $settings.Replace('</w:settings>', '<w:updateFields w:val="true"/></w:settings>')
  [IO.File]::WriteAllText($settingsPath, $settings, [Text.UTF8Encoding]::new($false))
}

if (Test-Path $zipPath) { Remove-Item -LiteralPath $zipPath -Force }
if (Test-Path $final) { Remove-Item -LiteralPath $final -Force }
Compress-Archive -Path (Join-Path $package '*') -DestinationPath $zipPath -CompressionLevel Optimal
Move-Item -LiteralPath $zipPath -Destination $final

Write-Output $final
