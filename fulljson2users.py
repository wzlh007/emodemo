#!/usr/bin/python
import json
import random
import math
#Function:Analyze json script
#Json is a script can descript data structure as xml, 
#for detail, please refer to "http://json.org/json-zh.html".

#Note:
#1.Also, if you write json script from python,
#you should use dump instead of load. pleaser refer to "help(json)".

#json file:
#The file content of temp.json is:
#{
# "name":"00_sample_case1",
# "description":"an example."
#}
#f = file("temp.json");
#s = json.load(f)
#print s
#f.close

def value2color2(value):
    d = 255/9
    if(value<=1):
        return [0,0,0,150]
    elif(value<=2):
        return [d,d,d,150]
    elif(value<=3):
        return [2*d,2*d,2*d,150]
    elif(value<=4):
        return [3*d,3*d,3*d,150]
    elif(value<=7):
        return [4*d,4*d,4*d,150]
    elif(value<=14):
        return [5*d,5*d,5*d,150]
    elif(value<=34):
        return [6*d,6*d,6*d,150]
    elif(value<=54):
        return [7*d,7*d,7*d,150]
    elif(value<=74):
        return [8*d,8*d,8*d,150]
    else:
        return [255,255,255,150]

    
#json string:
file = 'fullInput.json'
##�������ļ�
fp = open(file,'r')
print type(fp)
##��ȡ�����ļ�
content = fp.read()
print type(content)
##��strת��Ϊlist
lists = json.loads(content)
print type(lists)

##����cmzl�ı�
czml = [{"id" : "document","name" : "fulldata userCount pieces","version" : "1.0"}]
##print type(czml)
##entity = {}
##entity["id"] = "123123"
##print entity
##czml.append(entity)
##print czml[1]["id"]
starttime = '2016-03-17T17:00:00Z'
endtime = '2016-03-18T17:00:00Z'
num = -1
rownum = len(lists)
##rownum = 100
for i in range(0, rownum):
    ##��ʼ
    if(lists[i]["gridID"]!=num):
        entity = {}
        entity["id"] = str(lists[i]["gridID"])
        entity["name"] = 'grid'+str(lists[i]["gridID"])
        print entity["name"]
        
        ##����rectangleͼ��
        rectangle = {}
        ##rectangle ��λ������
        coordinates = {}
        lon =lists[i]["lon"]
        lat =lists[i]["lat"]
        wsenDegrees = [lon-0.025,lat-0.025,lon+0.025,lat+0.025]
        coordinates["wsenDegrees"] = wsenDegrees
        rectangle["coordinates"] = coordinates
        ##rectangle����ʽ
        rectangle["outline"] = 0
        rectangle["fill"] = 1
##        rectangle["outlineWidth"] = 4
##        outlineColor = {}
        rgba = []
        rgba.append(lists[i]["time"])
        starttime = lists[i]["time"]
        rgb = value2color2(lists[i]["userCount"])
        rgba.append(rgb[0])
        rgba.append(rgb[1])
        rgba.append(rgb[2])
        rgba.append(rgb[3])

##        outlineColor["rgba"] = rgba
##        rectangle["outlineColor"] = outlineColor
        color = {}
        solidColor = {}
        material ={}
        color["rgba"] = rgba
        solidColor["color"] = color
        material["solidColor"] = solidColor
        rectangle["material"] = material
        entity["rectangle"] = rectangle
        num=num+1
    ##�м����
    else:
        rgba.append(lists[i]["time"])
        rgb = value2color2(lists[i]["biFollow"])
        rgba.append(rgb[0])
        rgba.append(rgb[1])
        rgba.append(rgb[2])
        rgba.append(rgb[3])
        rectangle["material"]["solidColor"]["color"]["rgba"] = rgba

        entity["rectangle"] = rectangle
        if(i+1<rownum):
            if(lists[i]["gridID"]!=lists[i+1]["gridID"]):
                ##���һ��
                endtime = lists[i]["time"]
                entity["availability"] = starttime+'/'+endtime
                czml.append(entity)
            else:
                print '�м�'
                ##�м�
        else:
            endtime = lists[i]["time"]
            entity["availability"] = starttime+'/'+endtime
            czml.append(entity)
##print czml
s3 = json.dumps(czml)
##print s3
##�������ļ�
fileout = 'fullUserCount.czml'
##�������ļ�
fout = open(fileout,'w')
fout.write(s3)
fout.close();
fp.close()

# print s
# print s.keys()
# print s["name"]
# print s["type"]["name"]
# print s["type"]["parameter"][1]


