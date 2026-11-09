@REM ----------------------------------------------------------------------------
@REM Maven Wrapper for LedgerLine Backend
@REM Auto-bootstraps Apache Maven 3.9.9 if not present
@REM Fixes invalid JAVA_HOME paths on Windows
@REM ----------------------------------------------------------------------------
@echo off
setlocal enabledelayedexpansion

@REM Fix JAVA_HOME if invalid or pointing to non-existent directory
if not exist "%JAVA_HOME%\bin\java.exe" (
    if exist "C:\Program Files\Java\jdk-25.0.2\bin\java.exe" (
        set "JAVA_HOME=C:\Program Files\Java\jdk-25.0.2"
    ) else if exist "C:\Program Files\Java\jdk-21\bin\java.exe" (
        set "JAVA_HOME=C:\Program Files\Java\jdk-21"
    )
)
if defined JAVA_HOME (
    set "PATH=%JAVA_HOME%\bin;%PATH%;C:\Windows\System32;C:\Windows\System32\WindowsPowerShell\v1.0;%SystemRoot%\System32\WindowsPowerShell\v1.0"
)

@REM Check if system mvn exists
where mvn >nul 2>&1
if %ERRORLEVEL% equ 0 (
    mvn %*
    exit /b %ERRORLEVEL%
)

@REM Check if wrapper Maven already downloaded
set "WRAPPER_DIR=%USERPROFILE%\.m2\wrapper\dists\apache-maven-3.9.9"
set "MAVEN_CMD=%WRAPPER_DIR%\apache-maven-3.9.9\bin\mvn.cmd"

if exist "%MAVEN_CMD%" (
    call "%MAVEN_CMD%" %*
    exit /b %ERRORLEVEL%
)

echo [LedgerLine] System Maven not found. Downloading Apache Maven 3.9.9 wrapper...
if not exist "%WRAPPER_DIR%" mkdir "%WRAPPER_DIR%"
set "ZIP_FILE=%WRAPPER_DIR%\apache-maven-3.9.9-bin.zip"
set "URL=https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/3.9.9/apache-maven-3.9.9-bin.zip"
set "PS_EXE=%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe"
if not exist "%PS_EXE%" set "PS_EXE=powershell.exe"

"%PS_EXE%" -NoProfile -ExecutionPolicy Bypass -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; try { (New-Object System.Net.WebClient).DownloadFile('%URL%', '%ZIP_FILE%') } catch { (New-Object System.Net.WebClient).DownloadFile('https://archive.apache.org/dist/maven/maven-3/3.9.9/binaries/apache-maven-3.9.9-bin.zip', '%ZIP_FILE%') }; Expand-Archive -Path '%ZIP_FILE%' -DestinationPath '%WRAPPER_DIR%' -Force; Remove-Item -Force '%ZIP_FILE%'"

if not exist "%MAVEN_CMD%" (
    echo [ERROR] Failed to download or extract Maven. Please install Maven or check your network connection.
    exit /b 1
)

echo [LedgerLine] Maven 3.9.9 configured successfully!
call "%MAVEN_CMD%" %*
exit /b %ERRORLEVEL%
