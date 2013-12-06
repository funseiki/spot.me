package com.spotme;

import java.io.UnsupportedEncodingException;
import java.util.List;
import java.util.concurrent.ExecutionException;

import org.apache.http.HttpEntity;
import org.apache.http.NameValuePair;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.json.JSONObject;

public class Utils {

	public static final String GPS_LOCATION_TAG = "GPS_TRACKER";
	public static final long GPS_UPDATE_PERIOD = 5 * 60 * 1000;
	public static final float GPS_UPDATE_DIST = 10;

	public static final double LATITUDE_DEFAULT = 40.1137;
	public static final double LONGITUDE_DEFAULT = -88.224;

	/**
	 * send the request and get back the result string
	 * 
	 * @param msg
	 *            message
	 * @return response in json format
	 */
	public static JSONObject executeRequest(Message msg) {
		
		JSONObject result = null;
		try {
			result = new ServerConnection().execute(msg).get();
		} catch (InterruptedException e) {
			e.printStackTrace();
		} catch (ExecutionException e) {
			e.printStackTrace();
		}
		return result;
	}

	/**
	 * This function handles non-image request. See Login.java for sample use.
	 * 
	 * @param pairs
	 * @return
	 */
	public static HttpEntity convertToEntity(List<NameValuePair> pairs) {
		HttpEntity entity = null;
		try {
			entity = new UrlEncodedFormEntity(pairs);
		} catch (UnsupportedEncodingException e) {
			e.printStackTrace();
		}
		return entity;

	}
}
