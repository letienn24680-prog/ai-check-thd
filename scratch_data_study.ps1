# scratch/data_study.ps1 - 340 distinct academic scenarios for "Học tập"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$studyScenarios = [System.Collections.Generic.List[PSObject]]::new()

function Add-Study($topic, $title, $quote, $task, $source, $verdict, $explain) {
  $obj = [PSCustomObject]@{
    group   = "Học tập"
    topic   = $topic
    title   = $title
    quote   = $quote
    task    = $task
    source  = $source
    verdict = $verdict
    explain = $explain
  }
  $studyScenarios.Add($obj)
}

Write-Host "Populating Academic Scenarios..."

