if not DEFINED IS_MINIMIZED set IS_MINIMIZED=1 && start "Python server - scavenging" /min "%~dpnx0" %* && exit

start /max chrome --new-window http://localhost:8000/scavenging.html
python -m http.server 8000

exit
