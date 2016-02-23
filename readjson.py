#!/usr/bin/python
import json
import random
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

def value2color(value):
    d1 = (255-232)/5
    d2 = (255-57)/5
    d3 = (255-41)/5
    d4 = (255-22)/4
    d5 = (255-94)/4
    d6 = (255-131)/4
    if(value<=1):
        return [22,94,131]
    elif(value<=2):
        return [22+d4,94+d5,131+d6]
    elif(value<=3):
        return [22+d4*2,94+d5*2,131+d6*2]
    elif(value<=4):
        return [22+d4*3,94+d5*3,131+d6*3]
    elif(value<=5):
        return [255,255,255]
    elif(value<=6):
        return [232+4*d1,57+4*d2,41+4*d3]
    elif(value<=7):
        return [232+3*d1,57+3*d2,41+3*d3]
    elif(value<=8):
        return [232+2*d1,57+2*d2,41+2*d3]
    elif(value<=9):
        return [232+d1,57+d2,41+d3]
    else:
        return [232,57,41]

    
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
czml = [{"id" : "document","name" : "CZML Geometries: Polygon","version" : "1.0"}]
##print type(czml)
##entity = {}
##entity["id"] = "123123"
##print entity
##czml.append(entity)
##print czml[1]["id"]
starttime = '2015-12-09T00:00:00Z'
endtime = '2015-12-17T00:00:00Z'
num = -1
rownum = len(lists)
for i in range(0, rownum):
    ##开始
    if(lists[i]["gridID"]!=num):
        entity = {}
        entity["id"] = str(lists[i]["gridID"])
        entity["name"] = 'grid'+str(lists[i]["gridID"])
        print entity["name"]
        entity["availability"] = starttime+'/'+endtime
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
        rectangle["outline"] = 1
        rectangle["fill"] = 0
        rectangle["outlineWidth"] = 4
        outlineColor = {}
        rgba = []
        rgba.append(lists[i]["date"]+"T00:00:00Z")
        print lists[i]["date"]
        rgb = value2color(random.uniform(0,10))
        rgba.append(rgb[0])
        rgba.append(rgb[1])
        rgba.append(rgb[2])
        rgba.append(255)
        outlineColor["rgba"] = rgba
        rectangle["outlineColor"] = outlineColor
        extrudedHeight = {}
        number = []
        number.append(lists[i]["date"]+"T00:00:00Z")
        number.append(lists[i]["weiboCount"]*100)
        extrudedHeight["number"] = number
        rectangle["extrudedHeight"] = extrudedHeight
        entity["rectangle"] = rectangle
        num=num+1
    ##中间添加
    else:
        if(i+1<rownum):
            if(lists[i]["gridID"]!=lists[i+1]["gridID"]):
                czml.append(entity)
            else:
                ##中间
                rgba.append(lists[i]["date"]+"T00:00:00Z")
                print lists[i]["date"]
                rgb = value2color(random.uniform(0,10))
                rgba.append(rgb[0])
                rgba.append(rgb[1])
                rgba.append(rgb[2])
                rgba.append(255)
                outlineColor["rgba"] = rgba
                rectangle["outlineColor"] = outlineColor
                number.append(lists[i]["date"]+"T00:00:00Z")
                number.append(lists[i]["weiboCount"]*100)
                extrudedHeight["number"] = number
                rectangle["extrudedHeight"] = extrudedHeight
                entity["rectangle"] = rectangle
        else:
            czml.append(entity)
##print czml
s3 = json.dumps(czml)
##print s3
##创建新文件
fileout = 'result1.czml'
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


