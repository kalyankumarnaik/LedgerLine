@echo off
set "PATH=%PATH%;C:\Windows\System32;C:\Windows;C:\Windows\System32\Wbem;C:\Windows\System32\WindowsPowerShell\v1.0;C:\Program Files\Java\jdk-25.0.2\bin;C:\Program Files\PostgreSQL\18\bin"
C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe -NoProfile -InputFormat None %*
