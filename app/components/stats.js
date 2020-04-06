import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import * as am4maps from "@amcharts/amcharts4/maps";
import am4geodata_worldLow from "@amcharts/amcharts4-geodata/worldLow";
import am4themes_dark from "@amcharts/amcharts4/themes/dark";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";

export default class StatsComponent extends Component {

    @tracked infections = "--";
    @tracked today_infections = "--";
    @tracked active_percentage = "--";
    @tracked deaths = "--";
    @tracked today_deaths = "--";
    @tracked recoveries = "--";
    @tracked recoveries_remaining = "--";
    @tracked critical = "--";
    @tracked deaths_percentage = "--";
    @tracked recoveries_percentage = "--";
    @tracked critical_percentage = "--";
    cases = 0;
    deathsn = 0;
    recovered = 0;

    @tracked countries_data = [];

    countries_info = [];

    global_timeline = [];

    constructor(owner, args)
    {
        super(owner, args);
        console.log("configuring");
        this.getData();
    }

    getData()
    {
        fetch('http://api.coronastatistics.live/all')
            .then((data => {
                return data.json();
            }))
            .then((data) => {
                console.log(data);
                this.infections = this.formatNumber(data.cases);
                this.cases = data.cases;
                this.deaths = this.formatNumber(data.deaths);
                this.deathsn = data.deaths;
                this.deaths_percentage = (data.deaths / (data.deaths + data.recovered) * 100).toFixed(2);
                this.recoveries = this.formatNumber(data.recovered);
                this.recoveries_percentage = (data.recovered / (data.deaths + data.recovered) * 100).toFixed(2);
                this.recoveries_remaining = this.formatNumber(data.cases - data.recovered - data.deaths);
                this.recovered = data.recovered;
            });

        fetch('http://api.coronastatistics.live/countries')
            .then((data) => {
                return data.json();
            })
            .then((data) => {
                this.countries_data = data;
                this.processCountries();
                return fetch('https://restcountries.eu/rest/v2/all')
            })
            .then((data) => {
                return data.json();
            })
            .then((data) => {
                this.countries_info = data;
                //this.initializeMap();
            });
            
            fetch('http://api.coronastatistics.live/timeline/global')
            .then((data) => {
                return data.json();
            })
            .then((data) => {
                this.global_timeline = data;
                this.initializeLineChart();
            });
    }

    processCountries()
    {
        var c = 0;
        var tc = 0;
        var td = 0;
        this.countries_data.forEach(x => {
            c += x.critical;
            tc += x.todayCases;
            td += x.todayDeaths;
        });
        this.critical_percentage = (c / (this.cases - this.deathsn - this.recovered) * 100).toFixed(2);
        this.active_percentage = (100 - this.critical_percentage).toFixed(2)
        this.critical = c;
        this.today_infections = tc;
        this.today_deaths = td;
        this.initializeGauge();
        this.initializePie();
    }

    formatNumber(number)
    {
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    initializeMap()
    {
        am4core.useTheme(am4themes_dark);
        // Themes end
        
        // Create map instance
        let chart = am4core.create("mapChart", am4maps.MapChart);
        
        let title = chart.titles.create();
        title.text = "[bold font-size: 20]Population of the World in 2011[/]\nsource: Gapminder";
        title.textAlign = "middle";
        
        let mapData = [
          { "id":"AF", "name":"Afghanistan", "value":32358260, "color": chart.colors.getIndex(0) },
          { "id":"AL", "name":"Albania", "value":3215988, "color":chart.colors.getIndex(1) },
          { "id":"DZ", "name":"Algeria", "value":35980193, "color":chart.colors.getIndex(2) },
          { "id":"AO", "name":"Angola", "value":19618432, "color":chart.colors.getIndex(2) },
          { "id":"AR", "name":"Argentina", "value":40764561, "color":chart.colors.getIndex(3) },
          { "id":"AM", "name":"Armenia", "value":3100236, "color":chart.colors.getIndex(1) },
          { "id":"AU", "name":"Australia", "value":22605732, "color":"#8aabb0" },
          { "id":"AT", "name":"Austria", "value":8413429, "color":chart.colors.getIndex(1) },
          { "id":"AZ", "name":"Azerbaijan", "value":9306023, "color":chart.colors.getIndex(1) },
          { "id":"BH", "name":"Bahrain", "value":1323535, "color": chart.colors.getIndex(0) },
          { "id":"BD", "name":"Bangladesh", "value":150493658, "color": chart.colors.getIndex(0) },
          { "id":"BY", "name":"Belarus", "value":9559441, "color":chart.colors.getIndex(1) },
          { "id":"BE", "name":"Belgium", "value":10754056, "color":chart.colors.getIndex(1) },
          { "id":"BJ", "name":"Benin", "value":9099922, "color":chart.colors.getIndex(2) },
          { "id":"BT", "name":"Bhutan", "value":738267, "color": chart.colors.getIndex(0) },
          { "id":"BO", "name":"Bolivia", "value":10088108, "color":chart.colors.getIndex(3) },
          { "id":"BA", "name":"Bosnia and Herzegovina", "value":3752228, "color":chart.colors.getIndex(1) },
          { "id":"BW", "name":"Botswana", "value":2030738, "color":chart.colors.getIndex(2) },
          { "id":"BR", "name":"Brazil", "value":196655014, "color":chart.colors.getIndex(3) },
          { "id":"BN", "name":"Brunei", "value":405938, "color": chart.colors.getIndex(0) },
          { "id":"BG", "name":"Bulgaria", "value":7446135, "color":chart.colors.getIndex(1) },
          { "id":"BF", "name":"Burkina Faso", "value":16967845, "color":chart.colors.getIndex(2) },
          { "id":"BI", "name":"Burundi", "value":8575172, "color":chart.colors.getIndex(2) },
          { "id":"KH", "name":"Cambodia", "value":14305183, "color": chart.colors.getIndex(0) },
          { "id":"CM", "name":"Cameroon", "value":20030362, "color":chart.colors.getIndex(2) },
          { "id":"CA", "name":"Canada", "value":34349561, "color":chart.colors.getIndex(4) },
          { "id":"CV", "name":"Cape Verde", "value":500585, "color":chart.colors.getIndex(2) },
          { "id":"CF", "name":"Central African Rep.", "value":4486837, "color":chart.colors.getIndex(2) },
          { "id":"TD", "name":"Chad", "value":11525496, "color":chart.colors.getIndex(2) },
          { "id":"CL", "name":"Chile", "value":17269525, "color":chart.colors.getIndex(3) },
          { "id":"CN", "name":"China", "value":1347565324, "color": chart.colors.getIndex(0) },
          { "id":"CO", "name":"Colombia", "value":46927125, "color":chart.colors.getIndex(3) },
          { "id":"KM", "name":"Comoros", "value":753943, "color":chart.colors.getIndex(2) },
          { "id":"CD", "name":"Congo, Dem. Rep.", "value":67757577, "color":chart.colors.getIndex(2) },
          { "id":"CG", "name":"Congo, Rep.", "value":4139748, "color":chart.colors.getIndex(2) },
          { "id":"CR", "name":"Costa Rica", "value":4726575, "color":chart.colors.getIndex(4) },
          { "id":"CI", "name":"Cote d'Ivoire", "value":20152894, "color":chart.colors.getIndex(2) },
          { "id":"HR", "name":"Croatia", "value":4395560, "color":chart.colors.getIndex(1) },
          { "id":"CU", "name":"Cuba", "value":11253665, "color":chart.colors.getIndex(4) },
          { "id":"CY", "name":"Cyprus", "value":1116564, "color":chart.colors.getIndex(1) },
          { "id":"CZ", "name":"Czech Rep.", "value":10534293, "color":chart.colors.getIndex(1) },
          { "id":"DK", "name":"Denmark", "value":5572594, "color":chart.colors.getIndex(1) },
          { "id":"DJ", "name":"Djibouti", "value":905564, "color":chart.colors.getIndex(2) },
          { "id":"DO", "name":"Dominican Rep.", "value":10056181, "color":chart.colors.getIndex(4) },
          { "id":"EC", "name":"Ecuador", "value":14666055, "color":chart.colors.getIndex(3) },
          { "id":"EG", "name":"Egypt", "value":82536770, "color":chart.colors.getIndex(2) },
          { "id":"SV", "name":"El Salvador", "value":6227491, "color":chart.colors.getIndex(4) },
          { "id":"GQ", "name":"Equatorial Guinea", "value":720213, "color":chart.colors.getIndex(2) },
          { "id":"ER", "name":"Eritrea", "value":5415280, "color":chart.colors.getIndex(2) },
          { "id":"EE", "name":"Estonia", "value":1340537, "color":chart.colors.getIndex(1) },
          { "id":"ET", "name":"Ethiopia", "value":84734262, "color":chart.colors.getIndex(2) },
          { "id":"FJ", "name":"Fiji", "value":868406, "color":"#8aabb0" },
          { "id":"FI", "name":"Finland", "value":5384770, "color":chart.colors.getIndex(1) },
          { "id":"FR", "name":"France", "value":63125894, "color":chart.colors.getIndex(1) },
          { "id":"GA", "name":"Gabon", "value":1534262, "color":chart.colors.getIndex(2) },
          { "id":"GM", "name":"Gambia", "value":1776103, "color":chart.colors.getIndex(2) },
          { "id":"GE", "name":"Georgia", "value":4329026, "color":chart.colors.getIndex(1) },
          { "id":"DE", "name":"Germany", "value":82162512, "color":chart.colors.getIndex(1) },
          { "id":"GH", "name":"Ghana", "value":24965816, "color":chart.colors.getIndex(2) },
          { "id":"GR", "name":"Greece", "value":11390031, "color":chart.colors.getIndex(1) },
          { "id":"GT", "name":"Guatemala", "value":14757316, "color":chart.colors.getIndex(4) },
          { "id":"GN", "name":"Guinea", "value":10221808, "color":chart.colors.getIndex(2) },
          { "id":"GW", "name":"Guinea-Bissau", "value":1547061, "color":chart.colors.getIndex(2) },
          { "id":"GY", "name":"Guyana", "value":756040, "color":chart.colors.getIndex(3) },
          { "id":"HT", "name":"Haiti", "value":10123787, "color":chart.colors.getIndex(4) },
          { "id":"HN", "name":"Honduras", "value":7754687, "color":chart.colors.getIndex(4) },
          { "id":"HK", "name":"Hong Kong, China", "value":7122187, "color": chart.colors.getIndex(0) },
          { "id":"HU", "name":"Hungary", "value":9966116, "color":chart.colors.getIndex(1) },
          { "id":"IS", "name":"Iceland", "value":324366, "color":chart.colors.getIndex(1) },
          { "id":"IN", "name":"India", "value":1241491960, "color": chart.colors.getIndex(0) },
          { "id":"ID", "name":"Indonesia", "value":242325638, "color": chart.colors.getIndex(0) },
          { "id":"IR", "name":"Iran", "value":74798599, "color": chart.colors.getIndex(0) },
          { "id":"IQ", "name":"Iraq", "value":32664942, "color": chart.colors.getIndex(0) },
          { "id":"IE", "name":"Ireland", "value":4525802, "color":chart.colors.getIndex(1) },
          { "id":"IL", "name":"Israel", "value":7562194, "color": chart.colors.getIndex(0) },
          { "id":"IT", "name":"Italy", "value":60788694, "color":chart.colors.getIndex(1) },
          { "id":"JM", "name":"Jamaica", "value":2751273, "color":chart.colors.getIndex(4) },
          { "id":"JP", "name":"Japan", "value":126497241, "color": chart.colors.getIndex(0) },
          { "id":"JO", "name":"Jordan", "value":6330169, "color": chart.colors.getIndex(0) },
          { "id":"KZ", "name":"Kazakhstan", "value":16206750, "color": chart.colors.getIndex(0) },
          { "id":"KE", "name":"Kenya", "value":41609728, "color":chart.colors.getIndex(2) },
          { "id":"KP", "name":"Korea, Dem. Rep.", "value":24451285, "color": chart.colors.getIndex(0) },
          { "id":"KR", "name":"Korea, Rep.", "value":48391343, "color": chart.colors.getIndex(0) },
          { "id":"KW", "name":"Kuwait", "value":2818042, "color": chart.colors.getIndex(0) },
          { "id":"KG", "name":"Kyrgyzstan", "value":5392580, "color": chart.colors.getIndex(0) },
          { "id":"LA", "name":"Laos", "value":6288037, "color": chart.colors.getIndex(0) },
          { "id":"LV", "name":"Latvia", "value":2243142, "color":chart.colors.getIndex(1) },
          { "id":"LB", "name":"Lebanon", "value":4259405, "color": chart.colors.getIndex(0) },
          { "id":"LS", "name":"Lesotho", "value":2193843, "color":chart.colors.getIndex(2) },
          { "id":"LR", "name":"Liberia", "value":4128572, "color":chart.colors.getIndex(2) },
          { "id":"LY", "name":"Libya", "value":6422772, "color":chart.colors.getIndex(2) },
          { "id":"LT", "name":"Lithuania", "value":3307481, "color":chart.colors.getIndex(1) },
          { "id":"LU", "name":"Luxembourg", "value":515941, "color":chart.colors.getIndex(1) },
          { "id":"MK", "name":"Macedonia, FYR", "value":2063893, "color":chart.colors.getIndex(1) },
          { "id":"MG", "name":"Madagascar", "value":21315135, "color":chart.colors.getIndex(2) },
          { "id":"MW", "name":"Malawi", "value":15380888, "color":chart.colors.getIndex(2) },
          { "id":"MY", "name":"Malaysia", "value":28859154, "color": chart.colors.getIndex(0) },
          { "id":"ML", "name":"Mali", "value":15839538, "color":chart.colors.getIndex(2) },
          { "id":"MR", "name":"Mauritania", "value":3541540, "color":chart.colors.getIndex(2) },
          { "id":"MU", "name":"Mauritius", "value":1306593, "color":chart.colors.getIndex(2) },
          { "id":"MX", "name":"Mexico", "value":114793341, "color":chart.colors.getIndex(4) },
          { "id":"MD", "name":"Moldova", "value":3544864, "color":chart.colors.getIndex(1) },
          { "id":"MN", "name":"Mongolia", "value":2800114, "color": chart.colors.getIndex(0) },
          { "id":"ME", "name":"Montenegro", "value":632261, "color":chart.colors.getIndex(1) },
          { "id":"MA", "name":"Morocco", "value":32272974, "color":chart.colors.getIndex(2) },
          { "id":"MZ", "name":"Mozambique", "value":23929708, "color":chart.colors.getIndex(2) },
          { "id":"MM", "name":"Myanmar", "value":48336763, "color": chart.colors.getIndex(0) },
          { "id":"NA", "name":"Namibia", "value":2324004, "color":chart.colors.getIndex(2) },
          { "id":"NP", "name":"Nepal", "value":30485798, "color": chart.colors.getIndex(0) },
          { "id":"NL", "name":"Netherlands", "value":16664746, "color":chart.colors.getIndex(1) },
          { "id":"NZ", "name":"New Zealand", "value":4414509, "color":"#8aabb0" },
          { "id":"NI", "name":"Nicaragua", "value":5869859, "color":chart.colors.getIndex(4) },
          { "id":"NE", "name":"Niger", "value":16068994, "color":chart.colors.getIndex(2) },
          { "id":"NG", "name":"Nigeria", "value":162470737, "color":chart.colors.getIndex(2) },
          { "id":"NO", "name":"Norway", "value":4924848, "color":chart.colors.getIndex(1) },
          { "id":"OM", "name":"Oman", "value":2846145, "color": chart.colors.getIndex(0) },
          { "id":"PK", "name":"Pakistan", "value":176745364, "color": chart.colors.getIndex(0) },
          { "id":"PA", "name":"Panama", "value":3571185, "color":chart.colors.getIndex(4) },
          { "id":"PG", "name":"Papua New Guinea", "value":7013829, "color":"#8aabb0" },
          { "id":"PY", "name":"Paraguay", "value":6568290, "color":chart.colors.getIndex(3) },
          { "id":"PE", "name":"Peru", "value":29399817, "color":chart.colors.getIndex(3) },
          { "id":"PH", "name":"Philippines", "value":94852030, "color": chart.colors.getIndex(0) },
          { "id":"PL", "name":"Poland", "value":38298949, "color":chart.colors.getIndex(1) },
          { "id":"PT", "name":"Portugal", "value":10689663, "color":chart.colors.getIndex(1) },
          { "id":"PR", "name":"Puerto Rico", "value":3745526, "color":chart.colors.getIndex(4) },
          { "id":"QA", "name":"Qatar", "value":1870041, "color": chart.colors.getIndex(0) },
          { "id":"RO", "name":"Romania", "value":21436495, "color":chart.colors.getIndex(1) },
          { "id":"RU", "name":"Russia", "value":142835555, "color":chart.colors.getIndex(1) },
          { "id":"RW", "name":"Rwanda", "value":10942950, "color":chart.colors.getIndex(2) },
          { "id":"SA", "name":"Saudi Arabia", "value":28082541, "color": chart.colors.getIndex(0) },
          { "id":"SN", "name":"Senegal", "value":12767556, "color":chart.colors.getIndex(2) },
          { "id":"RS", "name":"Serbia", "value":9853969, "color":chart.colors.getIndex(1) },
          { "id":"SL", "name":"Sierra Leone", "value":5997486, "color":chart.colors.getIndex(2) },
          { "id":"SG", "name":"Singapore", "value":5187933, "color": chart.colors.getIndex(0) },
          { "id":"SK", "name":"Slovak Republic", "value":5471502, "color":chart.colors.getIndex(1) },
          { "id":"SI", "name":"Slovenia", "value":2035012, "color":chart.colors.getIndex(1) },
          { "id":"SB", "name":"Solomon Islands", "value":552267, "color":"#8aabb0" },
          { "id":"SO", "name":"Somalia", "value":9556873, "color":chart.colors.getIndex(2) },
          { "id":"ZA", "name":"South Africa", "value":50459978, "color":chart.colors.getIndex(2) },
          { "id":"ES", "name":"Spain", "value":46454895, "color":chart.colors.getIndex(1) },
          { "id":"LK", "name":"Sri Lanka", "value":21045394, "color": chart.colors.getIndex(0) },
          { "id":"SD", "name":"Sudan", "value":34735288, "color":chart.colors.getIndex(2) },
          { "id":"SR", "name":"Suriname", "value":529419, "color":chart.colors.getIndex(3) },
          { "id":"SZ", "name":"Swaziland", "value":1203330, "color":chart.colors.getIndex(2) },
          { "id":"SE", "name":"Sweden", "value":9440747, "color":chart.colors.getIndex(1) },
          { "id":"CH", "name":"Switzerland", "value":7701690, "color":chart.colors.getIndex(1) },
          { "id":"SY", "name":"Syria", "value":20766037, "color": chart.colors.getIndex(0) },
          { "id":"TW", "name":"Taiwan", "value":23072000, "color": chart.colors.getIndex(0) },
          { "id":"TJ", "name":"Tajikistan", "value":6976958, "color": chart.colors.getIndex(0) },
          { "id":"TZ", "name":"Tanzania", "value":46218486, "color":chart.colors.getIndex(2) },
          { "id":"TH", "name":"Thailand", "value":69518555, "color": chart.colors.getIndex(0) },
          { "id":"TG", "name":"Togo", "value":6154813, "color":chart.colors.getIndex(2) },
          { "id":"TT", "name":"Trinidad and Tobago", "value":1346350, "color":chart.colors.getIndex(4) },
          { "id":"TN", "name":"Tunisia", "value":10594057, "color":chart.colors.getIndex(2) },
          { "id":"TR", "name":"Turkey", "value":73639596, "color":chart.colors.getIndex(1) },
          { "id":"TM", "name":"Turkmenistan", "value":5105301, "color": chart.colors.getIndex(0) },
          { "id":"UG", "name":"Uganda", "value":34509205, "color":chart.colors.getIndex(2) },
          { "id":"UA", "name":"Ukraine", "value":45190180, "color":chart.colors.getIndex(1) },
          { "id":"AE", "name":"United Arab Emirates", "value":7890924, "color": chart.colors.getIndex(0) },
          { "id":"GB", "name":"United Kingdom", "value":62417431, "color":chart.colors.getIndex(1) },
          { "id":"US", "name":"United States", "value":313085380, "color":chart.colors.getIndex(4) },
          { "id":"UY", "name":"Uruguay", "value":3380008, "color":chart.colors.getIndex(3) },
          { "id":"UZ", "name":"Uzbekistan", "value":27760267, "color": chart.colors.getIndex(0) },
          { "id":"VE", "name":"Venezuela", "value":29436891, "color":chart.colors.getIndex(3) },
          { "id":"PS", "name":"West Bank and Gaza", "value":4152369, "color": chart.colors.getIndex(0) },
          { "id":"VN", "name":"Vietnam", "value":88791996, "color": chart.colors.getIndex(0) },
          { "id":"YE", "name":"Yemen, Rep.", "value":24799880, "color": chart.colors.getIndex(0) },
          { "id":"ZM", "name":"Zambia", "value":13474959, "color":chart.colors.getIndex(2) },
          { "id":"ZW", "name":"Zimbabwe", "value":12754378, "color":chart.colors.getIndex(2) }
        ];
        
        // Set map definition
        chart.geodata = am4geodata_worldLow;
        
        // Set projection
        chart.projection = new am4maps.projections.Miller();
        
        // Create map polygon series
        let polygonSeries = chart.series.push(new am4maps.MapPolygonSeries());
        polygonSeries.exclude = ["AQ"];
        polygonSeries.useGeodata = true;
        polygonSeries.nonScalingStroke = true;
        polygonSeries.strokeWidth = 0.5;
        polygonSeries.calculateVisualCenter = true;
        
        let imageSeries = chart.series.push(new am4maps.MapImageSeries());
        imageSeries.data = mapData;
        imageSeries.dataFields.value = "value";
        
        let imageTemplate = imageSeries.mapImages.template;
        imageTemplate.nonScaling = true
        
        let circle = imageTemplate.createChild(am4core.Circle);
        circle.fillOpacity = 0.7;
        circle.propertyFields.fill = "color";
        circle.tooltipText = "{name}: [bold]{value}[/]";
        
        
        imageSeries.heatRules.push({
          "target": circle,
          "property": "radius",
          "min": 4,
          "max": 30,
          "dataField": "value"
        })
        
        imageTemplate.adapter.add("latitude", function(latitude, target) {
          let polygon = polygonSeries.getPolygonById(target.dataItem.dataContext.id);
          if(polygon){
            return polygon.visualLatitude;
           }
           return latitude;
        })
        
        imageTemplate.adapter.add("longitude", function(longitude, target) {
          let polygon = polygonSeries.getPolygonById(target.dataItem.dataContext.id);
          if(polygon){
            return polygon.visualLongitude;
           }
           return longitude;
        })

        /*
        am4core.useTheme(am4themes_dark);
        let chart = am4core.create("mapChart", am4maps.MapChart);
        chart.geodata = am4geodata_worldLow;
        chart.projection = new am4maps.projections.Miller();
        console.log("map cong");

        let mapData = [];

        this.countries_data.forEach((element) => {
            const country = this.countries_info.find(el => el.name == element.country);
            mapData.push({
                id: country.alpha2Code,
                name: element.country,
                value: element.cases,
                color: "#21afdd"
            })
        });

        console.log(mapData);

        let polygonSeries = chart.series.push(new am4maps.MapPolygonSeries());
        polygonSeries.exclude = ["AQ"];
        polygonSeries.useGeodata = true;
        polygonSeries.nonScalingStroke = true;
        polygonSeries.strokeWidth = 0.5;
        polygonSeries.calculateVisualCenter = true;

        let imageSeries = chart.series.push(new am4maps.MapImageSeries());
        imageSeries.data = mapData;
        imageSeries.dataFields.value = "value";

        let imageTemplate = imageSeries.mapImages.template;
        imageTemplate.nonScaling = true

        let circle = imageTemplate.createChild(am4core.Circle);
        circle.fillOpacity = 0.7;
        circle.propertyFields.fill = "color";
        circle.tooltipText = "{name}: [bold]{value}[/]";


        imageSeries.heatRules.push({
        "target": circle,
        "property": "radius",
        "min": 4,
        "max": 30,
        "dataField": "value"
        })

        imageTemplate.adapter.add("latitude", function(latitude, target) {
        let polygon = polygonSeries.getPolygonById(target.dataItem.dataContext.id);
        if(polygon){
            return polygon.visualLatitude;
        }
        return latitude;
        })

        imageTemplate.adapter.add("longitude", function(longitude, target) {
        let polygon = polygonSeries.getPolygonById(target.dataItem.dataContext.id);
        if(polygon){
            return polygon.visualLongitude;
        }
        return longitude;
        })*/

    }

    initializeGauge()
    {
        am4core.useTheme(am4themes_dark);
        let chart = am4core.create("gaugeChart", am4charts.RadarChart);
        chart.colors.list = [
            am4core.color("#f9c851"),
            am4core.color("#ff5b5b"),
            am4core.color("#10c469"),
            am4core.color("#21afdd")
          ];

        chart.data = [{
        "category": "Critical",
        "value": this.critical_percentage,
        "full": 100,
        }, {
        "category": "Death",
        "value": this.deaths_percentage,
        "full": 100
        }, {
        "category": "Recovered",
        "value": this.recoveries_percentage,
        "full": 100
        }, {
        "category": "Active",
        "value": this.active_percentage,
        "full": 100
        }];

        chart.startAngle = -90;
        chart.endAngle = 180;
        chart.innerRadius = am4core.percent(20);

        // Set number format
        chart.numberFormatter.numberFormat = "#.#'%'";

        // Create axes
        let categoryAxis = chart.yAxes.push(new am4charts.CategoryAxis());
        categoryAxis.dataFields.category = "category";
        categoryAxis.renderer.grid.template.location = 0;
        categoryAxis.renderer.grid.template.strokeOpacity = 0;
        categoryAxis.renderer.labels.template.horizontalCenter = "right";
        categoryAxis.renderer.labels.template.fontWeight = 500;
        categoryAxis.renderer.labels.template.adapter.add("fill", function(fill, target) {
        return (target.dataItem.index >= 0) ? chart.colors.getIndex(target.dataItem.index) : fill;
        });
        categoryAxis.renderer.minGridDistance = 10;

        let valueAxis = chart.xAxes.push(new am4charts.ValueAxis());
        valueAxis.renderer.grid.template.strokeOpacity = 0;
        valueAxis.min = 0;
        valueAxis.max = 100;
        valueAxis.strictMinMax = true;

        // Create series
        let series1 = chart.series.push(new am4charts.RadarColumnSeries());
        series1.dataFields.valueX = "full";
        series1.dataFields.categoryY = "category";
        series1.clustered = false;
        series1.columns.template.fill = new am4core.InterfaceColorSet().getFor("alternativeBackground");
        series1.columns.template.fillOpacity = 0.08;
        series1.columns.template.cornerRadiusTopLeft = 20;
        series1.columns.template.strokeWidth = 0;
        series1.columns.template.radarColumn.cornerRadius = 20;

        let series2 = chart.series.push(new am4charts.RadarColumnSeries());
        series2.dataFields.valueX = "value";
        series2.dataFields.categoryY = "category";
        series2.clustered = false;
        series2.columns.template.strokeWidth = 0;
        series2.columns.template.tooltipText = "{category}: [bold]{value}[/]";
        series2.columns.template.radarColumn.cornerRadius = 20;

        series2.columns.template.adapter.add("fill", function(fill, target) {
        return chart.colors.getIndex(target.dataItem.index);
        });

        // Add cursor
        chart.cursor = new am4charts.RadarCursor();
    }

    initializePie() {
        am4core.useTheme(am4themes_dark);
        am4core.useTheme(am4themes_animated);
        let chart = am4core.create("pieChart", am4charts.PieChart);
        
        let data = [];

        this.countries_data = this.countries_data.sort((a, b) => {
            return b.cases - a.cases
        });

        console.log(this.countries_data);

        var i = 0;
        var count = 0;

        for(var x = 0; x < this.countries_data.length; x++) {
            var el = this.countries_data[x];
            console.log(el);
            if(i < 10) {
                data.push({
                    country: el.country,
                    cases: el.cases,
                    percentage: (el.cases / this.cases * 100).toFixed(1)
                })
                i++;
                count += el.cases;
            }
            else {
                break;
            }
        }

        data.push({
            country: "Others",
            cases: this.cases - count,
            percentage: ((this.cases - count) / this.cases * 100).toFixed(1)
        })

        chart.data = data;

        let pieSeries = chart.series.push(new am4charts.PieSeries());
        pieSeries.dataFields.value = "cases";
        pieSeries.dataFields.category = "country";
        pieSeries.slices.template.stroke = am4core.color("#fff");
        pieSeries.slices.template.strokeWidth = 2;
        pieSeries.slices.template.strokeOpacity = 1;
        pieSeries.slices.template.tooltipText = "{category}: {percentage}% ({cases})";
        pieSeries.hiddenState.properties.opacity = 1;
        pieSeries.hiddenState.properties.endAngle = -90;
        pieSeries.hiddenState.properties.startAngle = -90;
    }

    initializeLineChart()
    {
        am4core.useTheme(am4themes_dark);
        am4core.useTheme(am4themes_animated);
        let chart = am4core.create("lineChart", am4charts.XYChart);
        
        let data = [];
        var obj = Object.entries(this.global_timeline);
        obj.forEach((el) => {
            data.push({
                date: el[0],
                cases: el[1].cases,
                deaths: el[1].deaths,
                recovered: el[1].recovered
            });
        });

        chart.data = data;

        // Create axes
        let dateAxis = chart.xAxes.push(new am4charts.DateAxis());
        dateAxis.renderer.grid.template.location = 0;

        let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
        valueAxis.logarithmic = false;

        let s1 = chart.series.push(new am4charts.LineSeries());
        s1.dataFields.valueY = "cases";
        s1.dataFields.dateX = "date";
        s1.tensionX = 1;
        s1.tensionY = 1;
        s1.strokeWidth = 2;
        s1.stroke = am4core.color("#21afdd");

        let s2 = chart.series.push(new am4charts.LineSeries());
        s2.dataFields.valueY = "recovered";
        s2.dataFields.dateX = "date";
        s2.tensionX = 0.8;
        s2.strokeWidth = 2;
        s2.stroke = am4core.color("#10c469");
        // Create series
        let series = chart.series.push(new am4charts.LineSeries());
        series.dataFields.valueY = "deaths";
        series.dataFields.dateX = "date";
        series.tensionX = 0.8;
        series.strokeWidth = 2;
        series.stroke = am4core.color("#ff5b5b");

        /*
        let bullet = series.bullets.push(new am4charts.CircleBullet());
        bullet.circle.fill = am4core.color("#fff");
        bullet.circle.strokeWidth = 3;
        */

        // Add cursor
        chart.cursor = new am4charts.XYCursor();
        chart.cursor.fullWidthLineX = true;
        chart.cursor.xAxis = dateAxis;
        chart.cursor.lineX.strokeWidth = 0;
        chart.cursor.lineX.fill = am4core.color("#000");
        chart.cursor.lineX.fillOpacity = 0.1;

        // Add scrollbar
        // chart.scrollbarX = new am4core.Scrollbar();
    }

}
