# Commit each changed file with a semantic message derived from its path.
$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

function Get-SemanticCommitMessage {
    param([string]$RelativePath)
    $p = $RelativePath -replace '\\', '/'
    $file = [System.IO.Path]::GetFileName($p)
    $base = [System.IO.Path]::GetFileNameWithoutExtension($file)

    switch -Regex ($p) {
        '^\.gitignore$' { return 'chore: add root gitignore' }
        '^README\.md$' { return 'docs: add project readme' }
        '^backend/\.env\.example$' { return 'chore(backend): add environment example' }
        '^backend/package-lock\.json$' { return 'chore(backend): add package lockfile' }
        '^backend/package\.json$' { return 'chore(backend): configure backend dependencies' }
        '^backend/seedDoctors\.js$' { return 'chore(backend): add standalone doctor seed script' }
        '^backend/src/app\.js$' { return 'feat(backend): wire Express application' }
        '^backend/src/server\.js$' { return 'feat(backend): add server entry point' }
        '^backend/src/bootstrapDemo\.js$' { return 'feat(backend): add demo data bootstrap' }
        '^backend/src/demoAccounts\.js$' { return 'feat(backend): define demo account fixtures' }
        '^backend/src/seed\.js$' { return 'feat(backend): add database seed routine' }
        '^backend/src/config/db\.js$' { return 'feat(backend/config): add MongoDB connection' }
        '^backend/src/models/(.+)\.js$' { return "feat(backend/models): add $base model" }
        '^backend/src/controllers/(.+)\.js$' { return "feat(backend/controllers): add $base" }
        '^backend/src/routes/(.+)\.js$' { return "feat(backend/routes): add $base" }
        '^backend/src/middleware/(.+)\.js$' { return "feat(backend/middleware): add $base" }
        '^backend/src/utils/(.+)\.js$' { return "feat(backend/utils): add $base helper" }
        '^frontend/\.gitignore$' { return 'chore(frontend): add frontend gitignore' }
        '^frontend/README\.md$' { return 'docs(frontend): add frontend readme' }
        '^frontend/package-lock\.json$' { return 'chore(frontend): add package lockfile' }
        '^frontend/package\.json$' { return 'chore(frontend): configure frontend dependencies' }
        '^frontend/(eslint\.config\.js|postcss\.config\.js|tailwind\.config\.js|vite\.config\.ts)$' {
            return "chore(frontend): add $base build config"
        }
        '^frontend/tsconfig.*\.json$' { return "chore(frontend): add $file TypeScript config" }
        '^frontend/index\.html$' { return 'chore(frontend): add HTML entry shell' }
        '^frontend/public/' { return "chore(frontend/public): add $file" }
        '^frontend/src/assets/' { return "chore(frontend/assets): add $file" }
        '^frontend/src/api/' { return "feat(frontend/api): add $base client" }
        '^frontend/src/contexts/' { return "feat(frontend/contexts): add $base context" }
        '^frontend/src/hooks/' { return "feat(frontend/hooks): add $base hook" }
        '^frontend/src/lib/' { return "feat(frontend/lib): add $base utility" }
        '^frontend/src/data/' { return "feat(frontend/data): add $base data module" }
        '^frontend/src/services/' { return "feat(frontend/services): add $base service" }
        '^frontend/src/components/ui/' { return "feat(frontend/ui): add $base component" }
        '^frontend/src/components/landing/CTASection\.tsx$' {
            return 'feat(frontend/landing): add CTA section without Book Demo button'
        }
        '^frontend/src/components/landing/' { return "feat(frontend/landing): add $base section" }
        '^frontend/src/components/layout/' { return "feat(frontend/layout): add $base layout" }
        '^frontend/src/components/appointments/' { return "feat(frontend/appointments): add $base" }
        '^frontend/src/components/' { return "feat(frontend/components): add $base" }
        '^frontend/src/pages/' { return "feat(frontend/pages): add $base page" }
        '^frontend/src/App\.tsx$' { return 'feat(frontend): add application routes' }
        '^frontend/src/main\.tsx$' { return 'feat(frontend): add React entry point' }
        '^frontend/src/index\.css$' { return 'feat(frontend): add global styles' }
        default { return "chore: add $p" }
    }
}

$files = @()
$files += git diff --name-only
$files += git ls-files --others --exclude-standard
$files = $files | Where-Object { $_ -and $_.Trim() } | Sort-Object -Unique

if ($files.Count -eq 0) {
    Write-Host 'No files to commit.'
    exit 0
}

Write-Host "Committing $($files.Count) files..."
foreach ($f in $files) {
    $msg = Get-SemanticCommitMessage -RelativePath $f
    git add -- "$f"
    git commit -m $msg
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Commit failed for: $f"
    }
    Write-Host "  OK  $msg  ($f)"
}

Write-Host 'Done. Pushing to origin/main...'
git push -u origin main
