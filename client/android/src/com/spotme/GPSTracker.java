package com.spotme;

import android.content.Context;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.os.Bundle;
import android.util.Log;
import android.widget.Toast;

/**
 * source:
 * http://niravranpara.blogspot.com/2013/04/android-get-current-gps-location
 * .html
 * 
 * @author jicongw
 * 
 */
public class GPSTracker implements LocationListener {

	private final Context mContext;

	private Location location; // location
	private double latitude; // latitude
	private double longitude; // longitude

	// Declaring a Location Manager
	protected LocationManager locationManager;

	public GPSTracker(Context context) {
		this.mContext = context;
		this.locationManager = (LocationManager) mContext
				.getSystemService(Context.LOCATION_SERVICE);
		// startUsingGPS();
	}

	private void getLocationFromProvider(String provider) {
		boolean isEnabled = locationManager.isProviderEnabled(provider);
		if (isEnabled) {
			locationManager.requestLocationUpdates(provider,
					Utils.GPS_UPDATE_PERIOD, Utils.GPS_UPDATE_DIST, this);
			Log.d(Utils.GPS_LOCATION_TAG, "getLocationFromProvider");
			if (locationManager != null) {
				location = locationManager.getLastKnownLocation(provider);
			}
		} else {
			Toast.makeText(mContext, provider + " is not enabled",
					Toast.LENGTH_LONG).show();
		}
	}

	public void startUsingGPS() {
		getLocationFromProvider(LocationManager.NETWORK_PROVIDER);
		getLocationFromProvider(LocationManager.GPS_PROVIDER);
	}

	/**
	 * Stop using GPS listener Calling this function will stop using GPS in your
	 * app
	 * */
	public void stopUsingGPS() {
		if (locationManager != null) {
			locationManager.removeUpdates(GPSTracker.this);
		}
	}

	/**
	 * Function to get latitude
	 * */
	public double getLatitude() {
		if (location != null) {
			latitude = location.getLatitude();
		}
		// return latitude
		return latitude;
	}

	/**
	 * Function to get longitude
	 * */
	public double getLongitude() {
		if (location != null) {
			longitude = location.getLongitude();
		}
		// return longitude
		return longitude;
	}

	@Override
	public void onLocationChanged(Location location) {

	}

	@Override
	public void onProviderDisabled(String provider) {

	}

	@Override
	public void onProviderEnabled(String provider) {

	}

	@Override
	public void onStatusChanged(String provider, int status, Bundle extras) {

	}

}
