import urllib.parse as url
import requests
import json




r = requests.get('https://gr.grepolis.com/')
print(r.headers['Set-Cookie'])
hders=r.headers['Set-Cookie']
r2 = requests.post('https://gr.grepolis.com/glps/login_check?login%5Buserid%5D=tsiochris0001%40yahoo.gr&login%5Bpassword%5D=abcdefghik&login%5Bremember_me%5D=true',headers={'cookie':r.headers['Set-Cookie']})
print(r2.status_code,r2.headers['Set-Cookie'])
r3 = requests.get('https://gr0.grepolis.com/?action=login_from_glps&player_id=21&hash=1434c734ff',headers={'cookie':'metricsUvId=10c4c1af-00c4-49c7-a5c0-017ad04d2555'})
print(r3.status_code,r3.headers['Set-Cookie'])
r4 = requests.get('https://gr0.grepolis.com/start/index',headers={'cookie':r3.headers['set-cookie']+'pid=848924721; metricsUvId=10c4c1af-00c4-49c7-a5c0-017ad04d2555'})
print(r4.text,r3.headers['Set-Cookie'],r4.headers['Set-Cookie'])
