# Supabase Configuration Checker
Write-Host "=== Supabase Configuration Checker ===" -ForegroundColor Cyan
Write-Host ""

# Check for .env.local file
Write-Host "1. Checking for .env.local file..." -ForegroundColor Yellow
if (Test-Path .env.local) {
    Write-Host "   ✓ .env.local file exists" -ForegroundColor Green
    Write-Host "   Contents:" -ForegroundColor Gray
    Get-Content .env.local | ForEach-Object {
        if ($_ -match "SUPABASE") {
            if ($_ -match "URL") {
                $url = $_ -replace ".*=", ""
                Write-Host "   URL: $url" -ForegroundColor White
                Write-Host "   Testing DNS resolution..." -ForegroundColor Gray
                $hostname = ($url -replace "https?://", "") -replace "/.*", ""
                $result = nslookup $hostname 8.8.8.8 2>&1
                if ($result -match "Non-existent domain" -or $result -match "timed out") {
                    Write-Host "   ✗ DNS resolution FAILED - Domain does not exist!" -ForegroundColor Red
                    Write-Host "   This means your Supabase project URL is incorrect or the project was deleted." -ForegroundColor Red
                } else {
                    Write-Host "   ✓ DNS resolution successful" -ForegroundColor Green
                }
            } elseif ($_ -match "KEY") {
                $keyPreview = ($_ -replace ".*=", "").Substring(0, [Math]::Min(20, ($_ -replace ".*=", "").Length))
                Write-Host "   KEY: ${keyPreview}..." -ForegroundColor White
            }
        }
    }
} else {
    Write-Host "   ✗ .env.local file NOT FOUND" -ForegroundColor Red
    Write-Host "   You need to create this file with your Supabase credentials." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "2. Checking environment variables..." -ForegroundColor Yellow
$supabaseUrl = $env:NEXT_PUBLIC_SUPABASE_URL
$supabaseKey = $env:NEXT_PUBLIC_SUPABASE_ANON_KEY

if ($supabaseUrl) {
    Write-Host "   NEXT_PUBLIC_SUPABASE_URL is set: $supabaseUrl" -ForegroundColor White
} else {
    Write-Host "   NEXT_PUBLIC_SUPABASE_URL is NOT set" -ForegroundColor Gray
}

if ($supabaseKey) {
    Write-Host "   NEXT_PUBLIC_SUPABASE_ANON_KEY is set: ${supabaseKey.Substring(0, [Math]::Min(20, $supabaseKey.Length))}..." -ForegroundColor White
} else {
    Write-Host "   NEXT_PUBLIC_SUPABASE_ANON_KEY is NOT set" -ForegroundColor Gray
}

Write-Host ""
Write-Host "=== Recommendations ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "If DNS resolution failed:" -ForegroundColor Yellow
Write-Host "1. Verify your Supabase project exists at https://app.supabase.com" -ForegroundColor White
Write-Host "2. Check Project Settings → API for the correct Project URL" -ForegroundColor White
Write-Host "3. Make sure the project is active (not paused or deleted)" -ForegroundColor White
Write-Host "4. Create/update .env.local with the correct URL and API key" -ForegroundColor White
Write-Host ""
Write-Host "To create .env.local:" -ForegroundColor Yellow
Write-Host "1. Copy the template from SUPABASE_SETUP.md" -ForegroundColor White
Write-Host "2. Get your credentials from Supabase dashboard" -ForegroundColor White
Write-Host "3. Restart your dev server after creating the file" -ForegroundColor White

