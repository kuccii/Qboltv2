$file = "src/pages/Dashboard.tsx"
$content = Get-Content $file -Raw -Encoding UTF8

# Remove all corrupted emoji patterns
$content = $content -replace '≡ƒ[^\s<]*', ''
$content = $content -replace 'Γ[^\s<]*', ''
$content = $content -replace '<span>[^<]*</span>\s*', '' # Remove empty spans left behind

# Clean up any double spaces or empty lines
$content = $content -replace '\s+', ' '
$content = $content -replace '>\s+<', '><'

[System.IO.File]::WriteAllText((Resolve-Path $file), $content, [System.Text.Encoding]::UTF8)
Write-Host "Removed corrupted emoji characters from Dashboard.tsx"

