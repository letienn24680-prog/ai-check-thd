# build_1060_scenarios.ps1
# Generates 1060 distinct, high-quality, focused AI fact-checking scenarios for AI CHECK THD

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "Loading base 60 scenarios..."
$scenarios = [System.Collections.Generic.List[PSObject]]::new()

# Function to add scenario
function Add-S($group, $topic, $title, $quote, $task, $source, $verdict, $explain) {
    $scenarios.Add([PSCustomObject]@{
        group   = $group
        topic   = $topic
        title   = $title
        quote   = $quote
        task    = $task
        source  = $source
        verdict = $verdict
        explain = $explain
    })
}

Write-Host "Builder initialized."

