import json
import random
import math

def value2color(value):
    if(value<=5):
        return [22,94,131,255]
    else:
        return [232,57,41,255]

##�������ļ�
filep = 'pillar2.czml'
filee = 'emotion4short.json'
fp = open(filep,'r')
fe = open(filee,'r')
##��ȡ�����ļ�
contentp = fp.read()
contente = fe.read()
print type(contente)
##��strת��Ϊlist
lists = json.loads(contentp)
emolists = json.loads(contente)
##lists��ѭ������j������
j = 1
rownum = len(lists)
##emotion��ѭ������i
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
        
##��listת����str    
s3 = json.dumps(lists)
##�������ļ�
fileout = 'emopillarB.czml'
fout = open(fileout,'w')
##д�������ļ�
fout.write(s3)
fout.close()
fp.close()
fe.close()
