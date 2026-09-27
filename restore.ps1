$jsonLines = Get-Content 'C:\Venkatesh\KYT\scratch.json'
foreach ($jsonStr in $jsonLines) {
    try {
        $json = $jsonStr | ConvertFrom-Json
        foreach ($tool in $json.tool_calls) {
            if ($tool.name -eq 'write_to_file' -and $tool.args.TargetFile -match 'index.html') {
                $content = $tool.args.CodeContent
                if ($content.Length -gt 1000) {
                    [IO.File]::WriteAllText('C:\Venkatesh\KYT\index_restored.html', $content)
                    Write-Host "Restored index_restored.html (Length: $($content.Length))"
                    exit
                }
            }
        }
    } catch {
        Write-Host "Error parsing line"
    }
}

