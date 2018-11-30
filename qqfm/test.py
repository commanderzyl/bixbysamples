#coding=utf-8

import requests
# from bs4 import BeautifulSoup
# from lxml import html
import importlib,sys 
importlib.reload(sys)


refer = 'http://www.qingting.fm/categories/3617/0/1'
ids = ["3617" ,  "521" ,  "3251" ,  "527" ,  "545" ,  "529" ,  "1599" ,  "3636" ,  "531" ,  "3496" ,  "523" ,  "533" , "537" ,  "3252" ,  "547" ,  "3588" ,  "3613" ,  "543" ,  "1585" ,  "3385" ,  "535" ,  "3238" ,  "539" ,  "3276" , "3442" ,  "3427" ,  "1737" ,  "3597" ,  "3600" ,  "3330" ,  "3605" ,  "3599" ,  "3608" ,  "3637" ,  "3631" ,]
s = set()
for id in ids:
    for page in range(1000):
        url = 'http://i.qingting.fm/capi/neo-channel-filter?category=%s&attrs=0&curpage=%d' % (id, (page+1))
        print(url)
        headers={'Accept': '*/*',
                     'Accept-Encoding': 'gzip, deflate',
                     'Accept-Language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7',
                     'Connection': 'keep-alive',
                     'Host': 'i.qingting.fm',
                     'Referer': refer,
                     'Upgrade-Insecure-Requests': '1',
                     'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) '
                                   'Chrome/66.0.3359.181 Safari/537.36'}

        try:
            r = requests.get(url, timeout=5)
            r = r.json()
        except Exception as e:
            print('%s pages: %d' % (id, page - 1))
            break
        channels = r['data']['channels']
        if not channels or len(channels) == 0:
            break
        
        for i in range(len(channels)):
            s.add(channels[i]['title'])
f = open('album.txt','w',encoding='utf-8')
for item in s:
    f.write('\"'+item+'\"'+'\n')

f.close()
