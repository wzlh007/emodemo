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
    if(value<=22.3333):
        return [0,0,0,150]
    elif(value<=44.5714):
        return [d,d,d,150]
    elif(value<=63.1429):
        return [2*d,2*d,2*d,150]
    elif(value<=78.8095):
        return [3*d,3*d,3*d,150]
    elif(value<=94.7857):
        return [4*d,4*d,4*d,150]
    elif(value<=113.6582):
        return [5*d,5*d,5*d,150]
    elif(value<=135.5):
        return [6*d,6*d,6*d,150]
    elif(value<=168.4737):
        return [7*d,7*d,7*d,150]
    elif(value<=244):
        return [8*d,8*d,8*d,150]
    else:
        return [255,255,255,150]

    
#json string:
file = 'input1.json'
##打开数据文件
fp = open(file,'r')
print type(fp)
##读取数据文件
content = fp.read()
print type(content)
##将str转化为list
lists = json.loads(content)
print type(lists)

##创建cmzl文本
czml = [{"id" : "document","name" : "bifollow pieces","version" : "1.0"}]
##print type(czml)
##entity = {}
##entity["id"] = "123123"
##print entity
##czml.append(entity)
##print czml[1]["id"]
starttime = '2015-12-09T00:00:00Z'
endtime = '2015-12-16T00:00:00Z'
num = -1
rownum = len(lists)
##rownum = 100
for i in range(0, rownum):
    ##开始
    if(lists[i]["gridID"]!=num):
        entity = {}
        entity["id"] = str(lists[i]["gridID"])
        entity["name"] = 'grid'+str(lists[i]["gridID"])
        print entity["name"]
        
        ##创建rectangle图形
        rectangle = {}
        ##rectangle 的位置坐标
        coordinates = {}
        lon =lists[i]["lon"]
        lat =lists[i]["lat"]
        wsenDegrees = [lon-0.005,lat-0.005,lon+0.005,lat+0.005]
        coordinates["wsenDegrees"] = wsenDegrees
        rectangle["coordinates"] = coordinates
        ##rectangle的样式
        rectangle["outline"] = 0
        rectangle["fill"] = 1
##        rectangle["outlineWidth"] = 4
##        outlineColor = {}
        rgba = []
        rgba.append(lists[i]["date"]+"T00:00:00Z")
        starttime = lists[i]["date"]+"T00:00:00Z"
        rgb = value2color2(lists[i]["biFollow"])
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
		
##        extrudedHeight = {}
##        height = {}
##        number = []
##        number.append(lists[i]["date"]+"T00:00:00Z")
##        number.append(lists[i]["weiboCount"]*100+1000)
##        extrudedHeight["number"] = number
##        height["number"] = number
##        rectangle["extrudedHeight"] = extrudedHeight
##        rectangle["height"] = 0
        entity["rectangle"] = rectangle
        num=num+1
    ##中间添加
    else:
        rgba.append(lists[i]["date"]+"T00:00:00Z")
        rgb = value2color2(lists[i]["biFollow"])
        rgba.append(rgb[0])
        rgba.append(rgb[1])
        rgba.append(rgb[2])
        rgba.append(rgb[3])

##                rectangle["outlineColor"]["rgba"] = rgba
        rectangle["material"]["solidColor"]["color"]["rgba"] = rgba
##        number.append(lists[i]["date"]+"T00:00:00Z")
##        number.append(lists[i]["weiboCount"]*100+1000)
##                extrudedHeight["number"] = number
##        height["number"] = number
##                rectangle["extrudedHeight"] = extrudedHeight
##        rectangle["height"] = 0
        entity["rectangle"] = rectangle
        if(i+1<rownum):
            if(lists[i]["gridID"]!=lists[i+1]["gridID"]):
                ##最后一天
                endtime = lists[i]["date"]+"T00:00:00Z"
                entity["availability"] = starttime+'/'+endtime
                czml.append(entity)
            else:
                print '中间'
                ##中间
        else:
            endtime = lists[i]["date"]+"T00:00:00Z"
            entity["availability"] = starttime+'/'+endtime
            czml.append(entity)
##print czml
s3 = json.dumps(czml)
##print s3
##创建新文件
fileout = 'bifopiece.czml'
##打开数据文件
fout = open(fileout,'w')
fout.write(s3)
fout.close();
fp.close()

# print s
# print s.keys()
# print s["name"]
# print s["type"]["name"]
# print s["type"]["parameter"][1]


