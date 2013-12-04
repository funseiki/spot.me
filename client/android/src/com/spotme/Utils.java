package com.spotme;

import java.util.concurrent.ExecutionException;

import org.json.JSONException;
import org.json.JSONObject;

public class Utils {

	/**
	 * send the request and get back the result string
	 * 
	 * @param m
	 *            message
	 * @return response in string format
	 */
	public static String sendRequest(Message m) {
		JSONObject result = null;
		try {
			result = new ServerConnection().execute(m).get();
		} catch (InterruptedException e) {
			e.printStackTrace();
		} catch (ExecutionException e) {
			e.printStackTrace();
		}
		
		String str = null;
		try {
			str = result.getString("login_success");
		} catch (JSONException e) {
			e.printStackTrace();
		}
		return str;
	}

}
