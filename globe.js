/*global sharedObject, d3*/

(function() {
    "use strict";
    //var yearPerSec = 86400*365;
    var dayPerSec = 3600*24;
    var gregorianDate = new Cesium.GregorianDate();
    var cartesian3Scratch = new Cesium.Cartesian3();
	//声明一个datasource对象，与Cesium的dataSource对象相似
	//但是多了以下私有参数（private declarations）
    var weiboDataSource = function() {
        // private declarations
        this._name = "weibo demo";
        this._entityCollection = new Cesium.EntityCollection();
        this._clock = new Cesium.DataSourceClock();
        this._clock.startTime = Cesium.JulianDate.fromIso8601("2015-12-09");
        this._clock.stopTime = Cesium.JulianDate.fromIso8601("2015-12-16");
        this._clock.currentTime = Cesium.JulianDate.fromIso8601("2015-12-09");
        this._clock.clockRange = Cesium.ClockRange.LOOP_STOP;
        this._clock.clockStep = Cesium.ClockStep.SYSTEM_CLOCK_MULTIPLIER;
        //this._clock.multiplier = yearPerSec * 5;
        this._clock.multiplier = dayPerSec * 0.5;
        this._changed = new Cesium.Event();
        this._error = new Cesium.Event();
        this._isLoading = false;
        this._loading = new Cesium.Event();
        //this._year = 1800;
        this._date = "2015-12-09"//1800;
		//下面三个函数是财富、健康和人口的比例尺，让两组数据的值更好的显示在地球上
        this._wealthScale = d3.scale.log().domain([300, 1e5]).range([0, 10000000.0]);
		this._weiboCountScale = d3.scale.linear().domain([1,250]).range([100,25000.0]);		
		this._biFollowScale = d3.scale.sqrt().domain([0,20539]).range([2,200]);
		//this._userCountScale = d3.scale.pow().exponent(.5);
		this._userCountScale = d3.scale.linear().domain([1,231]).range([5,20.0]);
        this._healthScale = d3.scale.linear().domain([10, 85]).range([0, 10000000.0]);
        this._populationScale = d3.scale.sqrt().domain([0, 5e8]).range([5.0, 30.0]);
        this._colorScale = d3.scale.category20c();
        this._selectedEntity = undefined;
		//console.log('done 1');
    };
	//Cesium.DataSource对象中的默认参数
    Object.defineProperties(weiboDataSource.prototype, {
        name : {
            get : function() {
                return this._name;
            }
        },
        clock : {
            get : function() {
                return this._clock;
            }
        },
        entities : {
            get : function() {
                return this._entityCollection;
            }
        },
        selectedEntity : {
            get : function() {
                return this._selectedEntity;
            },
            set : function(e) {
                if (Cesium.defined(this._selectedEntity)) {
                    var entity = this._selectedEntity;
                    entity.polyline.material.color = new Cesium.ConstantProperty(Cesium.Color.fromCssColorString(this._colorScale(entity.gridID)));
                }
                if (Cesium.defined(e)) {
                    e.polyline.material.color = new Cesium.ConstantProperty(Cesium.Color.fromCssColorString('#00ff00'));
                }
                this._selectedEntity = e;
            }
        },
        /**
         * Gets a value indicating if the data source is currently loading data.
         * @memberof HealthAndWealthDataSource.prototype
         * @type {Boolean}
         */
        isLoading : {
            get : function() {
                return this._isLoading;
            }
        },
        /**
         * Gets an event that will be raised when the underlying data changes.
         * @memberof HealthAndWealthDataSource.prototype
         * @type {Event}
         */
        changedEvent : {
            get : function() {
                return this._changed;
            }
        },
        /**
         * Gets an event that will be raised if an error is encountered during
         * processing.
         * @memberof HealthAndWealthDataSource.prototype
         * @type {Event}
         */
        errorEvent : {
            get : function() {
                return this._error;
            }
        },
        /**
         * Gets an event that will be raised when the data source either starts or
         * stops loading.
         * @memberof HealthAndWealthDataSource.prototype
         * @type {Event}
         */
        loadingEvent : {
            get : function() {
                return this._loading;
            }
        }
		
    });
	//载入外部geojson文件
    weiboDataSource.prototype.loadUrl = function(url) {
		
        if (!Cesium.defined(url)) {
            throw new Cesium.DeveloperError("url must be defined.");
        }

        var that = this;
        return Cesium.when(Cesium.loadJson(url), function(json) {
            //运行下面的load函数
			//console.log(json);
			return that.load(json);
        }).otherwise(function(error) {
            this._setLoading(false);
            that._error.raiseEvent(that, error);
            return Cesium.when.reject(error);
        });
    };
	//load函数用于实现三维动态可视化
    weiboDataSource.prototype.load = function(data) {
        if (!Cesium.defined(data)) {
            throw new Cesium.DeveloperError("data must be defined.");
        }
        var ellipsoid = viewer.scene.globe.ellipsoid;
		
        this._setLoading(true);
        var entities = this._entityCollection;
        //It's a good idea to suspend events when making changes to a 
        //large amount of entities.  This will cause events to be batched up
        //into the minimal amount of function calls and all take place at the
        //end of processing (when resumeEvents is called).
        entities.suspendEvents();
        entities.removeAll();

        // for each nation defined in nations_geo.json, create a polyline at that lat, lon
		//在每个国家（json 实体）中循环
		var rowCount=0;
		for(var j=0;j<752;j++){
			console.log(j);
			// Construct Wealth related Properties
			//sample是可以插值的对象，所以可以平滑的变化
			//构造财富相关的属性数据，wealth对象是一个带有时间、位置属性的序列，存储wealth在地球上的位置和高度
			var weiboCount = new Cesium.SampledPositionProperty();
			//sampledWealth是一个带有时间属性的序列，存储真实的income值
			var sampledWeiboCount = new Cesium.SampledProperty(Number);
			//同Wealth，构造地表柱形和真实值的sample
			var biFollow = new Cesium.SampledPositionProperty();
			var sampledBiFollow = new Cesium.SampledProperty(Number);
			//构造线宽和人口真实值的sample
			var userCount = new Cesium.SampledProperty(Number);
			var sampledUserCount = new Cesium.SampledProperty(Number);
			var surfacePosition;
			for (var i = rowCount; i < data.length; i++){
				var row = data[i];
				if(row.gridID==j){
					
					var heightPosition = Cesium.Cartesian3.fromDegrees(row.lon, row.lat, this._weiboCountScale(row.weiboCount), ellipsoid, cartesian3Scratch);
					//console.log(row.lon, row.lat,this._weiboCountScale(row.weiboCount));
					weiboCount.addSample(Cesium.JulianDate.fromIso8601(row.date.toString()), heightPosition);
					sampledWeiboCount.addSample(Cesium.JulianDate.fromIso8601(row.date.toString()), row.weiboCount);
					

					// Construct Health related Properties
					
					heightPosition = Cesium.Cartesian3.fromDegrees(row.lon, row.lat, this._biFollowScale(row.biFollow)*100, ellipsoid, cartesian3Scratch);
					biFollow.addSample(Cesium.JulianDate.fromIso8601(row.date.toString()), heightPosition);
					sampledBiFollow.addSample(Cesium.JulianDate.fromIso8601(row.date.toString()), row.biFollow);
					

					// Construct Population related Properties
					
					userCount.addSample(Cesium.JulianDate.fromIso8601(row.date.toString()), this._userCountScale(row.userCount));
					sampledUserCount.addSample(Cesium.JulianDate.fromIso8601(row.date.toString()), row.userCount);
					//在柱形图在地表的经纬度坐标
					surfacePosition = Cesium.Cartesian3.fromDegrees(row.lon, row.lat, 0.0);
				}
				else{
					rowCount=i;
					
					
					break;
				}
			}
			
			
			var polyline = new Cesium.PolylineGraphics();
			polyline.show = new Cesium.ConstantProperty(true);
			var outlineMaterial = new Cesium.PolylineOutlineMaterialProperty();
			//线框颜色因国家名称而变化，用colorScale实现
			outlineMaterial.color = new Cesium.ConstantProperty(Cesium.Color.fromCssColorString(this._colorScale(row.gridID)));
			outlineMaterial.outlineColor = new Cesium.ConstantProperty(new Cesium.Color(0.0, 0.0, 0.0, 1.0));
			outlineMaterial.outlineWidth = new Cesium.ConstantProperty(2.0);
			polyline.material = outlineMaterial;
			polyline.width = userCount;
			polyline.followSurface = new Cesium.ConstantProperty(false);
			//定义实体，添加polyline
			var entity = new Cesium.Entity(row.gridID.toString());
			entity.polyline = polyline;
			//polyline的位置就是地球表面到高度的位置
			polyline.positions = new Cesium.PositionPropertyArray([new Cesium.ConstantPositionProperty(surfacePosition), weiboCount]);

			// Add data properties to entity
			//将所有属性添加给polyline实体
			entity.addProperty('gridID');
			entity.gridID = row.gridID;
			entity.addProperty('weiboCount');
			entity.weiboCount = weiboCount;
			entity.addProperty('biFollow');
			entity.biFollow = biFollow;
			entity.addProperty('surfacePosition');
			entity.surfacePosition = surfacePosition;
			/* entity.addProperty('row');
			entity.row = row;  */
			entity.addProperty('sampledWeiboCount');
			entity.sampledWeiboCount = sampledWeiboCount;
			entity.addProperty('sampledBiFollow');
			entity.sampledBiFollow = sampledBiFollow;
			entity.addProperty('sampledUserCount');
			entity.sampledUserCount = sampledUserCount;
			//entity.description = new Cesium.ConstantProperty("foo");
			
			// if we wanted to use points instead ...
			//entity.position = wealth;
			//entity.point = new Cesium.PointGraphics();
			//entity.point.pixelSize = new Cesium.ConstantProperty(5);

			//Add the entity to the collection.
			entities.add(entity);
			
		}
		
        
		
        //Once all data is processed, call resumeEvents and raise the changed event.
        entities.resumeEvents();
        this._changed.raiseEvent(this);
        this._setLoading(false);
    };

    weiboDataSource.prototype._setLoading = function(isLoading) {
        if (this._isLoading !== isLoading) {
            this._isLoading = isLoading;
            this._loading.raiseEvent(this, isLoading);
        }
    };

    weiboDataSource.prototype._setInfoDialog = function(time) {
        if (Cesium.defined(this._selectedEntity)) {
			this._selectedEntity.name = this._selectedEntity.gridID;
            var sampledWeiboCount = this._selectedEntity.sampledWeiboCount.getValue(time);
            var sampledBiFollow = this._selectedEntity.sampledBiFollow.getValue(time);
            var sampledUserCount = this._selectedEntity.sampledUserCount.getValue(time);
            $("#info table").remove();
            $("#info").append("<table> \
            <tr><td>sampledWeiboCount:</td><td>" +parseFloat(sampledWeiboCount).toFixed(1)+"</td></tr>\
            <tr><td>sampledBiFollow:</td><td>" +parseFloat(sampledBiFollow).toFixed(1)+"</td></tr>\
            <tr><td>sampledUserCount:</td><td>" +parseFloat(sampledUserCount).toFixed(1)+"</td></tr>\
            </table>\
            ");
            $("#info table").css("font-size", "10px");
            $("#info").dialog({
                title : this._selectedEntity.gridID,
                width: 280,
                height: 150,
                modal: false,
                position: {my: "right center", at: "right center", of: "canvas"},
                show: "slow",
                beforeClose: function(event, ui) {
                    $("#info").data("dataSource").selectedEntity = undefined;
                }
            });
            $("#info").data("dataSource", this);
        }
    };

	//没改完，与D3相关，先放着
     weiboDataSource.prototype.update = function(time) {
        Cesium.JulianDate.toGregorianDate(time, gregorianDate);
        var currentYear = gregorianDate.year + gregorianDate.month / 12;
        if (currentYear !== this._year && typeof window.displayYear !== 'undefined'){
            window.displayYear(currentYear);
            this._year = currentYear;

            this._setInfoDialog(time);
        }

        return true;
    };

    $("#radio").buttonset();
    $("#radio").css("font-size", "12px");
    $("#radio").css("font-size", "12px");
    $("body").css("background-color", "black");
	
	$("#radio2").buttonset();
    $("#radio2").css("font-size", "12px");
    $("#radio2").css("font-size", "12px");
    $("body").css("background-color", "black");

    $("input[name='weiboCountbiFollow']").change(function(d){
        var entities = demo.entities.values;
        demo.entities.suspendEvents();
        for (var i = 0; i < entities.length; i++) {
            var entity = entities[i];
            if (d.target.id === 'weiboCount') {
                entity.polyline.positions = new Cesium.PositionPropertyArray([new Cesium.ConstantPositionProperty(entity.surfacePosition), entity.weiboCount]);
				//console.log('weibocount');
            } else {
                entity.polyline.positions = new Cesium.PositionPropertyArray([new Cesium.ConstantPositionProperty(entity.surfacePosition), entity.biFollow]);
				//console.log('biFollow');
            }
        }
        demo.entities.resumeEvents();
    });
	
    var viewer = new Cesium.Viewer('cesiumContainer', 
            {
                fullscreenElement : document.body,
                infoBox : false
            });

    var stamenTonerImagery = viewer.baseLayerPicker.viewModel.imageryProviderViewModels[8];
    viewer.baseLayerPicker.viewModel.selectedImagery = stamenTonerImagery;

    // setup clockview model
    viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP;
    //viewer.clock.clockRange = Cesium.ClockRange.CLAMPED ;
    viewer.clock.startTime = Cesium.JulianDate.fromIso8601("2015-12-09");
    viewer.clock.currentTime = Cesium.JulianDate.fromIso8601("2015-12-09");
    viewer.clock.stopTime = Cesium.JulianDate.fromIso8601("2015-12-16");
    viewer.clock.clockStep = Cesium.ClockStep.SYSTEM_CLOCK_MULTIPLIER;
    //viewer.clock.multiplier = yearPerSec * 5;
    viewer.clock.multiplier = dayPerSec * 0.5;
    //viewer.animation.viewModel.setShuttleRingTicks([yearPerSec, yearPerSec*5, yearPerSec*10, yearPerSec*50]);
    viewer.animation.viewModel.setShuttleRingTicks([dayPerSec, dayPerSec*5, dayPerSec*10, dayPerSec*50]);

    viewer.animation.viewModel.dateFormatter = function(date, viewModel) {
        Cesium.JulianDate.toGregorianDate(date, gregorianDate);
        //return 'Year: ' + gregorianDate.year;
        return gregorianDate.month+'月'+gregorianDate.day+'日';
    };
    viewer.animation.viewModel.timeFormatter = function(date, viewModel) {
        return '';
    };
    viewer.scene.skyBox.show = true;
    viewer.scene.sun.show = false;
    viewer.scene.moon.show = false;

    viewer.scene.morphToColumbusView(5.0)
    //viewer.scene.morphTo3D(5.0)
	
	var demo = new weiboDataSource();
	demo.loadUrl('demoStatistic2.json');
	var grid = new Cesium.GeoJsonDataSource();
	grid.load('gridwithvalue.geojson',{
		outlineWidth:1,
		material: Cesium.Color.fromRgba(0,0,0,0)
	});
	showGrid('grid');
	viewer.zoomTo(grid);
	function showGrid(label){
		viewer.dataSources.removeAll();
		var entities = grid.entities.values;

		for (var i = 0; i < entities.length; i++) {
			//For each entity, create a random color based on the state name.
			//Some states have multiple entities, so we store the color in a
			//hash so that we use the same color for the entire state.
			var entity = entities[i];
			//var name = entity.name;
			var color;
			if(label==='grid'){
				color = Cesium.Color.fromRgba(0,0,0,0);
				entity.polygon.outlineWidth = 1;
				entity.polygon.outline = true;
				entity.polygon.material = color;
			}
			else if(label==='restaurant'){
				color = fillGrid(entity.properties.restaurant);
				entity.polygon.outline = false;
				entity.polygon.material = color;
			}
			else if(label == 'scene'){
				color = fillGrid2(entity.properties.scene);
				entity.polygon.outline = false;
				entity.polygon.material = color;
			}
		}
		viewer.dataSources.add(grid);
		viewer.dataSources.add(demo);
	}
	
	$("input[name='gridpoi']").change(function(d){
		showGrid(d.target.id);
    });
	
	var value2color = [[12,50],[34,47],[62,44],[97,41],[131,38],[178,35],[275,32],[448,29],[662,26],[1008,23]];
	var value2color2 = [1,3,6,9,12,15,20,28,38,83];
	function fillGrid(num){
		var i = 0;
		for(i = 0;i < value2color.length;i++){
			if(num <= value2color[i][0]){
				var color = Cesium.Color.fromHsl(value2color[i][1]/360, 1, 0.8-i*0.02, 1);
				return color;
			}
		}
	}
	function fillGrid2(num){
		var i = 0;
		 for(i = 0;i < value2color2.length;i++){
			if(num < value2color2[i]){
				var color = Cesium.Color.fromHsl(125/360, 1, 0.9-i*0.04, 1);
				return color;
			}
		} 
	}
    // If the mouse is over the billboard, change its scale and color
/*     var highlightBarHandler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    highlightBarHandler.setInputAction(
        function (movement) {
            var pickedObject = viewer.scene.pick(movement.endPosition);
            if (Cesium.defined(pickedObject) && Cesium.defined(pickedObject.id)) {
                if (Cesium.defined(pickedObject.id.row)) {
                    sharedObject.dispatch.nationMouseover(pickedObject.id.row, pickedObject);
                    healthAndWealth.selectedEntity = pickedObject.id;
                }
            }
        },
        Cesium.ScreenSpaceEventType.MOUSE_MOVE
    ); */

/*     var flyToHandler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    flyToHandler.setInputAction(
        function (movement) {
            var pickedObject = viewer.scene.pick(movement.position);

            if (Cesium.defined(pickedObject) && Cesium.defined(pickedObject.id)) {
                sharedObject.flyTo(pickedObject.id.row);
            }
        },
        Cesium.ScreenSpaceEventType.LEFT_CLICK
    );

    // Response to a nation's mouseover event
    sharedObject.dispatch.on("nationMouseover.cesium", function(nationObject) {

        $("#info table").remove();
        $("#info").append("<table> \
        <tr><td>Life Expectancy:</td><td>" +parseFloat(nationObject.lifeExpectancy).toFixed(1)+"</td></tr>\
        <tr><td>Income:</td><td>" +parseFloat(nationObject.income).toFixed(1)+"</td></tr>\
        <tr><td>Population:</td><td>" +parseFloat(nationObject.population).toFixed(1)+"</td></tr>\
        </table>\
        ");
        $("#info table").css("font-size", "10px");
        $("#info").dialog({
            title : nationObject.name,
            width: 200,
            height: 150,
            modal: false,
            position: {my: "right center", at: "right center", of: "canvas"},
            show: "slow"
        });
      }); */


    // define functionality for flying to a nation
    // this callback is triggered when a nation is clicked
/*     sharedObject.flyTo = function(nationData) {
        var ellipsoid = viewer.scene.globe.ellipsoid;

        var destination = Cesium.Cartographic.fromDegrees(nationData.lon, nationData.lat - 5.0, 10000000.0);
        var destCartesian = ellipsoid.cartographicToCartesian(destination);
        destination = ellipsoid.cartesianToCartographic(destCartesian);

        // only fly there if it is not the camera's current position
        if (!ellipsoid
                   .cartographicToCartesian(destination)
                   .equalsEpsilon(viewer.scene.camera.positionWC, Cesium.Math.EPSILON6)) {

            viewer.scene.camera.flyTo({
                destination: destCartesian
            });
        }
    }; */

})();