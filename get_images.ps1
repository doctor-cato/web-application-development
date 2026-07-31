$cast = @("Chiwetel Ejiofor", "Renate Reinsve", "Mark Duplass")
foreach ($actor in $cast) {
    $url = "https://en.wikipedia.org/w/api.php?action=query&titles=$([uri]::EscapeDataString($actor))&prop=pageimages&format=json&pithumbsize=300"
    $response = Invoke-RestMethod -Uri $url
    $pages = $response.query.pages
    foreach ($page in $pages.PSObject.Properties) {
        $imageUrl = $page.Value.thumbnail.source
        Write-Host "$actor : $imageUrl"
    }
}
