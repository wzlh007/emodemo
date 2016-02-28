import json
import random
import math

def value2color(value):
    if(value<=5):
        return [22,94,131,255]
    else:
        return [232,57,41,255]

##打开数据文件
filep = 'pillar2.czml'
filee = 'emotion4short.json'
fp = open(filep,'r')
fe = open(filee,'r')
##读取数据文件
contentp = fp.read()
contente = fe.read()
print type(contente)
##将str转化为list
lists = json.loads(contentp)
emolists = json.loads(contente)
##lists的循环变量j和行数
j = 1
rownum = len(lists)
##emotion的循环变量i
for emo in emolists:
    if(j>=rownum):
        break
    if(str(emo["gridID"])==str(lists[j]["id"])):
        rgba = []
        rgba.append("2015-12-09T00:00:00Z")
        value = emo["9"]
        rgb = value2color(value)
        rgba.append(rgb[0])
        rgba.append(rgb[1])
        rgba.append(rgb[2])
        rgba.append(rgb[3])
        
        rgba.append("2015-12-10T00:00:00Z")
        value = emo["10"]
        rgb = value2color(value)
        rgba.append(rgb[0])
        rgba.append(rgb[1])
        rgba.append(rgb[2])
        rgba.append(rgb[3])

        rgba.append("2015-12-12T00:00:00Z")
        value = emo["12"]
        rgb = value2color(value)
        rgba.append(rgb[0])
        rgba.append(rgb[1])
        rgba.append(rgb[2])
        rgba.append(rgb[3])

        rgba.append("2015-12-14T00:00:00Z")
        value = emo["14"]
        rgb = value2color(value)
        rgba.append(rgb[0])
        rgba.append(rgb[1])
        rgba.append(rgb[2])
        rgba.append(rgb[3])

        rgba.append("2015-12-15T00:00:00Z")
        value = emo["15"]
        rgb = value2color(value)
        rgba.append(rgb[0])
        rgba.append(rgb[1])
        rgba.append(rgb[2])
        rgba.append(rgb[3])

        rgba.append("2015-12-16T00:00:00Z")
        value = emo["16"]
        rgb = value2color(value)
        rgba.append(rgb[0])
        rgba.append(rgb[1])
        rgba.append(rgb[2])
        rgba.append(rgb[3])

        ##lists[j]["outlineColor"] = {}
        ##outlineColor = {}
        ##outlineColor["rgba"] = rgba
        lists[j]["rectangle"]["outlineColor"]["rgba"] = rgba
        j=j+1
    else:
        print str(emo["gridID"])+' has no data'
        
##将list转换成str    
s3 = json.dumps(lists)
##创建新文件
fileout = 'emopillarB.czml'
fout = open(fileout,'w')
##写入数据文件
fout.write(s3)
fout.close()
fp.close()
fe.close()
