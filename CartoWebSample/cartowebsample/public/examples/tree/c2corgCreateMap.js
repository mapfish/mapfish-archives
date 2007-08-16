function c2corgCreateMap(mapDiv) {

    var options = {
        projection: "EPSG:4326",
        controls: [new OpenLayers.Control.MouseDefaults()] , 
        'numZoomLevels': 20
    };

    var map = new OpenLayers.Map(mapDiv , options);
    
    var wms = new OpenLayers.Layer.WMS("OpenLayers WMS", 
        "http://labs.metacarta.com/wms/vmap0",
        {layers: 'basic'}, 
        {isBaseLayer: true}
    );
    wms.setVisibility(false);
    map.addLayer(wms);

    var twms = new OpenLayers.Layer.WMS("World Map", 
        "http://world.freemap.in/cgi-bin/mapserv?", 
        {
            map: '/www/freemap.in/world/map/factbooktrans.map',
            transparent: true,
            layers: 'factbook',
            format: 'image/png'
        }
    );
    twms.setVisibility(false);
    map.addLayer(twms);
  
    c2cwmsLayers = ['parkings', 'summits', 'refuges', 'sites',
                    'countries', 'departements_fr', 'cantons_ch',
                    'massifs'];
    c2cwms = new OpenLayers.Layer.WMS.Untiled("C2C Objects",
        "http://dev.camptocamp.com/c2corg/wms?",
        {layers: c2cwmsLayers, format: 'image/png', transparent: true}
    );
    c2cwms.setVisibility(false);
    map.addLayer(c2cwms);  

    map.setCenter(new OpenLayers.LonLat(5,45), 6);
    map.addControl(new OpenLayers.Control.PanZoomBar());
    map.addControl(new OpenLayers.Control.LayerSwitcher());

    return map;
}
