# Fix incomplete primary color references
$files = Get-ChildItem -Path 'src' -Recurse -Filter '*.tsx' | Select-Object -ExpandProperty FullName

foreach ($file in $files) {
    $content = Get-Content $file -Raw
    
    # Fix incomplete primary- references (missing numbers) - more specific patterns
    $content = $content -replace 'dark:from-primary-/30', 'dark:from-primary-900/30'
    $content = $content -replace 'dark:to-primary-/30', 'dark:to-primary-800/30'
    $content = $content -replace 'dark:from-primary-/20', 'dark:from-primary-900/20'
    $content = $content -replace 'dark:to-primary-/20', 'dark:to-primary-800/20'
    $content = $content -replace 'dark:text-primary-\s', 'dark:text-primary-400 '
    $content = $content -replace 'dark:border-primary-\s', 'dark:border-primary-700 '
    $content = $content -replace 'dark:ring-primary-\s', 'dark:ring-primary-700 '
    $content = $content -replace 'text-primary-\s', 'text-primary-800 '
    $content = $content -replace 'border-primary-\s', 'border-primary-800 '
    $content = $content -replace 'group-hover:text-primary-\s', 'group-hover:text-primary-500 '
    $content = $content -replace 'hover:text-primary-\s', 'hover:text-primary-700 '
    $content = $content -replace 'hover:bg-primary-\s', 'hover:bg-primary-700 '
    $content = $content -replace 'hover:border-primary-\s', 'hover:border-primary-700 '
    $content = $content -replace 'dark:hover:text-primary-\s', 'dark:hover:text-primary-300 '
    
    Set-Content $file -Value $content -NoNewline
}

Write-Host "Incomplete color fixes complete!"

