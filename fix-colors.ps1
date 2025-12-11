# Fix color references to match brand book
$files = Get-ChildItem -Path 'src' -Recurse -Filter '*.tsx' | Select-Object -ExpandProperty FullName

foreach ($file in $files) {
    $content = Get-Content $file -Raw
    
    # Replace blue colors with primary colors
    $content = $content -replace 'text-blue-(\d+)', 'text-primary-$1'
    $content = $content -replace 'bg-blue-(\d+)', 'bg-primary-$1'
    $content = $content -replace 'border-blue-(\d+)', 'border-primary-$1'
    $content = $content -replace 'from-blue-(\d+)', 'from-primary-$1'
    $content = $content -replace 'to-blue-(\d+)', 'to-primary-$1'
    $content = $content -replace 'via-blue-(\d+)', 'via-primary-$1'
    $content = $content -replace 'ring-blue-(\d+)', 'ring-primary-$1'
    
    # Fix incomplete primary- references (missing numbers)
    $content = $content -replace 'from-primary-\s', 'from-primary-800 '
    $content = $content -replace 'to-primary-\s', 'to-primary-600 '
    $content = $content -replace 'via-primary-\s', 'via-primary-700 '
    $content = $content -replace 'border-primary-\s', 'border-primary-800 '
    $content = $content -replace 'text-primary-\s', 'text-primary-800 '
    $content = $content -replace 'bg-primary-\s', 'bg-primary-800 '
    $content = $content -replace 'ring-primary-\s', 'ring-primary-500 '
    
    # Fix dark mode incomplete references
    $content = $content -replace 'dark:from-primary-\s', 'dark:from-primary-900 '
    $content = $content -replace 'dark:to-primary-\s', 'dark:to-primary-800 '
    $content = $content -replace 'dark:via-primary-\s', 'dark:via-primary-800 '
    $content = $content -replace 'dark:border-primary-\s', 'dark:border-primary-700 '
    $content = $content -replace 'dark:text-primary-\s', 'dark:text-primary-400 '
    $content = $content -replace 'dark:bg-primary-\s', 'dark:bg-primary-900 '
    $content = $content -replace 'dark:ring-primary-\s', 'dark:ring-primary-700 '
    
    # Fix hover states
    $content = $content -replace 'hover:from-primary-\s', 'hover:from-primary-700 '
    $content = $content -replace 'hover:to-primary-\s', 'hover:to-primary-600 '
    $content = $content -replace 'hover:bg-primary-\s', 'hover:bg-primary-700 '
    $content = $content -replace 'hover:text-primary-\s', 'hover:text-primary-700 '
    $content = $content -replace 'hover:border-primary-\s', 'hover:border-primary-700 '
    
    # Fix focus states
    $content = $content -replace 'focus:ring-blue-', 'focus:ring-primary-'
    $content = $content -replace 'focus:border-blue-', 'focus:border-primary-'
    
    Set-Content $file -Value $content -NoNewline
}

Write-Host "Color fixes complete!"

