var geoUtils = {
    toRad: function (deg) {
        return deg*Math.PI/180.0;
    },

    Point: function (lat, lon) {
        return {
            latitude: lat,
            longitude: lon
        };
    },

    Distance: function (pt1Deg, pt2Deg) {
        // Radius in km
        var radius = 6373;

        // Get pts
        var pt1 = {
                latitude: toRad(pt1Deg.latitude),
                longitude: toRad(pt1Deg.longitude)
            },
            pt2 = {
                latitude: toRad(pt2Deg.latitude),
                longitude: toRad(pt2Deg.longitude)
            };

            // sin((lat1-lat2)/2)^2
        var left = Math.pow(Math.sin((pt2.latitude-pt2.latitude)/2.0), 2);
            // cos(lat1)*cos(lat2)*sin((long1-long2)/2)^2
        var right = Math.cos(pt1.latitude)*Math.cos(pt2.latitude)*Math.pow((pt2.longitude - pt1.longitude)/2, 2);
        var root = Math.sqrt(left + right);
        var d = 2*radius*Math.asin(root);
        return d;
    }
};

module.exports = geoUtils;
