const fetch = require("node-fetch");
//文件模块
const fs = require('fs');
//系统路径模块
const path = require('path');

function saveJSON(data, filename){
	if(!data) {
		alert('保存的数据为空');
		return;
	}
	if(!filename) 
		filename = 'json.json'
	if(typeof data === 'object'){
		data = JSON.stringify(data, undefined, 4)
	}
	
    let file = path.join(__dirname, filename);
    fs.writeFile(file, data, function (err) {
        if (err) {
            console.log(err);
        } else {
            console.log('文件创建成功~' + file);
        }
    });
}

function getWxAreaJson() {
    return fetch('http://127.0.0.1:8080/wxarea.json')
}

getWxAreaJson().then(res => {
   return res.json()
}).then(data => {
    let resultArr = []
    data.forEach(province => {
        let provinceObj = {
            area_name: province.province_name,
            area_code: province.province_code
        }
        let cityList = province.city;
        if(cityList.length === 0) {
            let areaObj = {
                area_name: province.province_name,
                area_code: province.province_code,
                city: provinceObj,
                province: provinceObj
            }
            resultArr.push(areaObj)
        } else {
            let citySp = false;
            cityList.forEach(city => {
                let cityObj = {
                    area_name: city.city_name,
                    area_code: city.city_code
                }
                let areaList = city.area;
                if(areaList.length === 0) {
                    let lastCityStr = city.city_name.charAt(city.city_name.length - 1)
                    if(lastCityStr === '区') {
                        // console.log('区', city)
                        citySp = true;
                    } else {
                        let areaObj = {
                            area_name: city.city_name,
                            area_code: city.city_code,
                            city: cityObj,
                            province: provinceObj
                        }
                        resultArr.push(areaObj)
                    }
                } else {
                    areaList.forEach(area => {
                        let lastStr = area.area_name.charAt(area.area_name.length - 1)
                        if(lastStr === '区') {
                            // console.log('区', area)
                        } else {
                            let areaObj = {
                                area_name: area.area_name,
                                area_code: area.area_code,
                                city: cityObj,
                                province: provinceObj
                            }
                            resultArr.push(areaObj)
                        }
                        
                    })
                }
                
            })

            if(citySp) {
                // 针对香港、澳门做特殊处理
                let areaObj = {
                    area_name: province.province_name,
                    area_code: province.province_code,
                    city: provinceObj,
                    province: provinceObj
                }
                resultArr.push(areaObj)
            }
        }
        
    });
    saveJSON(resultArr)
})