$port = 8000
$listener = New-Object System.Net.Sockets.TcpListener([System.Net.IPAddress]::Any, $port)
$listener.Start()
Write-Host "Server running on all interfaces on port $port!"
Write-Host "Access it from Desktop: http://localhost:$port/"
Write-Host "Access it from Android phone (same network): http://192.168.1.57:$port/"
Write-Host "Press Ctrl+C or stop the task to terminate."

try {
    while ($true) {
        $client = $listener.AcceptTcpClient()
        $stream = $client.GetStream()
        
        # Read the request
        $buffer = New-Object byte[] 4096
        $bytesRead = $stream.Read($buffer, 0, $buffer.Length)
        if ($bytesRead -eq 0) {
            $client.Close()
            continue
        }
        
        $requestText = [System.Text.Encoding]::UTF8.GetString($buffer, 0, $bytesRead)
        $lines = $requestText.Split("`n")
        if ($lines.Length -lt 1) {
            $client.Close()
            continue
        }
        
        $requestLine = $lines[0].Trim()
        $parts = $requestLine.Split(" ")
        if ($parts.Length -lt 2) {
            $client.Close()
            continue
        }
        
        $urlPath = $parts[1]
        
        # Remove query string if any
        $qIdx = $urlPath.IndexOf("?")
        if ($qIdx -ne -1) {
            $urlPath = $urlPath.Substring(0, $qIdx)
        }
        
        if ($urlPath -eq "/") {
            $urlPath = "/index.html"
        }
        
        # URL decode path (spaces etc.)
        $urlPath = [System.Uri]::UnescapeDataString($urlPath)
        
        $currentDir = (Get-Location).Path
        $requestedPath = [System.IO.Path]::GetFullPath((Join-Path $currentDir $urlPath))
        
        # Prevent directory traversal
        if (-not $requestedPath.StartsWith($currentDir)) {
            $responseHeader = "HTTP/1.1 403 Forbidden`r`nContent-Type: text/plain`r`nConnection: close`r`n`r`n403 Forbidden"
            $respBytes = [System.Text.Encoding]::UTF8.GetBytes($responseHeader)
            $stream.Write($respBytes, 0, $respBytes.Length)
            $client.Close()
            continue
        }
        
        if (Test-Path $requestedPath -PathType Leaf) {
            $bytes = [System.IO.File]::ReadAllBytes($requestedPath)
            
            $ext = [System.IO.Path]::GetExtension($requestedPath).ToLower()
            $contentType = "text/plain"
            if ($ext -eq ".html" -or $ext -eq ".htm") { $contentType = "text/html; charset=utf-8" }
            elseif ($ext -eq ".css") { $contentType = "text/css" }
            elseif ($ext -eq ".js") { $contentType = "text/javascript" }
            elseif ($ext -eq ".png") { $contentType = "image/png" }
            elseif ($ext -eq ".jpg" -or $ext -eq ".jpeg") { $contentType = "image/jpeg" }
            elseif ($ext -eq ".svg") { $contentType = "image/svg+xml" }
            
            $headers = "HTTP/1.1 200 OK`r`nContent-Type: $contentType`r`nContent-Length: $($bytes.Length)`r`nConnection: close`r`n`r`n"
            $headerBytes = [System.Text.Encoding]::UTF8.GetBytes($headers)
            
            $stream.Write($headerBytes, 0, $headerBytes.Length)
            $stream.Write($bytes, 0, $bytes.Length)
        } else {
            $errBody = "404 Not Found"
            $headers = "HTTP/1.1 404 Not Found`r`nContent-Type: text/plain`r`nContent-Length: $($errBody.Length)`r`nConnection: close`r`n`r`n$errBody"
            $respBytes = [System.Text.Encoding]::UTF8.GetBytes($headers)
            $stream.Write($respBytes, 0, $respBytes.Length)
        }
        
        $client.Close()
    }
} catch {
    Write-Error $_.Exception.Message
} finally {
    $listener.Stop()
}
