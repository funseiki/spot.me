package com.spotme;

import java.util.concurrent.ExecutionException;

public class Utils {
	/**
	 * send the request and get back the result string
	 * 
	 * @param m
	 *            message
	 * @return response in string format
	 */
	public static String sendRequest(Message m) {
		String result = null;
		try {
			result = new ServerConnection().execute(m).get();
		} catch (InterruptedException e) {
			e.printStackTrace();
		} catch (ExecutionException e) {
			e.printStackTrace();
		}
		return result;
	}

}
