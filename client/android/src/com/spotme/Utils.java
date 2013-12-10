package com.spotme;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.text.DecimalFormat;
import java.util.List;
import java.util.concurrent.ExecutionException;

import org.apache.http.HttpEntity;
import org.apache.http.NameValuePair;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.Bitmap.CompressFormat;
import android.util.Log;

public class Utils {
	public final static String UTILS_TAG = "UTILS";
	public final static String POST_TAG = "POST";
	public final static String GET_TAG = "GET";
	public final static String RESPONSE_TAG = "RESPONSE";
	// private final static String serverURL = "http://127.0.0.1:8080/";
	public final static String serverURL = "http://10.0.2.2:8080/";
	// public final static String serverURL = "https://spot-me.herokuapp.com";
	public final static String mainClueListGetRequest = "";
	public static final String CLUE_ADAPTER_TAG = "ClueAdapter";

	public static final String GPS_LOCATION_TAG = "GPS_TRACKER";
	public static final long GPS_UPDATE_PERIOD = 5 * 60 * 1000;
	public static final float GPS_UPDATE_DIST = 10;

	public static final double LATITUDE_DEFAULT = 40.1137;
	public static final double LONGITUDE_DEFAULT = -88.224;

	public static JSONObject[] getJSONArrayFromJsonObj(JSONObject obj,
			String name) {
		JSONArray result = null;
		try {
			result = obj.getJSONArray(name);
		} catch (JSONException e) {
			e.printStackTrace();
			Log.i(CLUE_ADAPTER_TAG, name + " does not exist in JSON object.");
		}
		JSONObject[] objs = new JSONObject[result.length()];
		for (int i = 0; i < result.length(); i++) {
			try {
				objs[i] = result.getJSONObject(i);
			} catch (JSONException e) {
				Log.d(UTILS_TAG, objs[i].toString());
				e.printStackTrace();
			}
		}
		return objs;
	}

	/**
	 * get data from json object
	 * 
	 * @param obj
	 * @param name
	 * @return
	 */
	public static String getDataFromJsonObj(JSONObject obj, String name) {
		String result = null;
		try {
			result = obj.getString(name);
		} catch (JSONException e) {
			e.printStackTrace();
			Log.i(CLUE_ADAPTER_TAG, name + " does not exist in JSON object.");
		}
		return result;
	}

	/**
	 * send the request and get back the result string
	 * 
	 * @param msg
	 *            message
	 * @return response in json array format
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

	public static double truncate(double d) {
		DecimalFormat df = new DecimalFormat("####.####");
		return Double.parseDouble(df.format(d));
	}

	public static JSONObject getIncorrectSampleData() {
		JSONObject obj = new JSONObject();
		try {
			obj.put("success", "false");
			obj.put("distance", "1500");
		} catch (JSONException e) {
			e.printStackTrace();
		}
		return obj;
	}

	public static File convertBitmapToFile(Context context, Bitmap bm) {
		File f = new File(context.getCacheDir(), "tmpFile.png");
		try {
			f.createNewFile();
		} catch (IOException e) {
			Log.i("NEW SPOT", "Fail to create file");
			e.printStackTrace();
		}

		// Convert bitmap to byte array
		ByteArrayOutputStream bos = new ByteArrayOutputStream();
		bm.compress(CompressFormat.PNG, 0 /* ignored for PNG */, bos);
		byte[] bitmapdata = bos.toByteArray();
		FileOutputStream fos;
		try {
			fos = new FileOutputStream(f);
			fos.write(bitmapdata);
			fos.flush();
			bos.flush();
			fos.close();
			bos.close();
		} catch (FileNotFoundException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
		return f;
	}

	public static JSONObject[] getCommentSampleData() {
		JSONObject[] objects = new JSONObject[6];
		JSONObject one = new JSONObject();
		try {
			one.put("nickname", "tommy");
			one.put("time", "0000-00-00");
			one.put("imgSrc",
					"http://icons.iconarchive.com/icons/deleket/sleek-xp-software/256/Yahoo-Messenger-icon.png");
			one.put("comment", "hey, what's up");
			one.put("spotId", "1");
		} catch (JSONException e) {
			e.printStackTrace();
		}
		JSONObject two = new JSONObject();
		try {
			two.put("nickname", "olie");
			two.put("time", "1111-00-00");
			two.put("imgSrc",
					"http://icons.iconarchive.com/icons/deleket/button/256/Button-Next-icon.png");
			two.put("comment", "not much, just a shitty clue");
			two.put("spotId", "1");
		} catch (JSONException e) {
			e.printStackTrace();
		}
		objects[0] = one;
		objects[1] = two;
		objects[2] = two;
		objects[3] = one;
		objects[4] = two;
		objects[5] = one;

		return objects;
	}

	public static JSONObject[] getClueListSampleData() {
		JSONObject[] objects = new JSONObject[6];

		JSONObject one = new JSONObject();
		try {
			one.put("clue", "hello world");
			one.put("imgSrc",
					"http://icons.iconarchive.com/icons/deleket/sleek-xp-software/256/Yahoo-Messenger-icon.png");
			one.put("imgSrc",
					"https://s3.amazonaws.com/spotme/spots/1fd9bc7606f730b506b29ac4e1a609fc7894c3a7a1e6f893928734fd4b12cf31951fd8ac913cfedbcc66f926c40e53ab.png");
			one.put("spotId", "1");
		} catch (JSONException e) {
			e.printStackTrace();
		}
		JSONObject two = new JSONObject();
		try {
			two.put("clue", "yolo");
			two.put("imgSrc",
					"http://icons.iconarchive.com/icons/deleket/button/256/Button-Next-icon.png");
			two.put("spotId", "123");
		} catch (JSONException e) {
			e.printStackTrace();
		}
		objects[0] = one;
		objects[1] = two;
		objects[2] = two;
		objects[3] = one;
		objects[4] = two;
		objects[5] = one;

		return objects;
	}
}
