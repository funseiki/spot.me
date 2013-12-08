package com.spotme;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;

import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.impl.client.DefaultHttpClient;
import org.json.JSONException;
import org.json.JSONObject;

import android.os.AsyncTask;
import android.util.Log;

public class ServerConnection extends AsyncTask<Message, Void, JSONObject> {

	private HttpClient hClient;
	private HttpPost hPost;
	private HttpGet hGet;
	private HttpResponse hRepsonse;

	public ServerConnection() {
		hClient = new DefaultHttpClient();
		hPost = null;
		hGet = null;
		hRepsonse = null;
	}

	private void postData(HttpEntity entity, String url) {
		hPost = new HttpPost(url);
		hPost.setEntity(entity);
		try {
			hRepsonse = hClient.execute(hPost);
		} catch (ClientProtocolException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	private void getData(String url) {
		hGet = new HttpGet(url);
		try {
			hRepsonse = hClient.execute(hGet);
		} catch (ClientProtocolException e) {
			Log.i(Utils.GET_TAG, "client protocol error");
			e.printStackTrace();
		} catch (IOException e) {
			Log.i(Utils.GET_TAG, "I/O error happens in getData");
			e.printStackTrace();
		}
	}

	private String retrieveData() {
		BufferedReader br = null;
		InputStreamReader isr = null;
		try {
			isr = new InputStreamReader(hRepsonse.getEntity().getContent());
			br = new BufferedReader(isr);
		} catch (IllegalStateException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
		StringBuilder sb = new StringBuilder();
		String line = null;
		try {
			while ((line = br.readLine()) != null)
				sb.append(line + "\n");
		} catch (IOException e) {
			e.printStackTrace();
		}
		return sb.toString();
	}

	private JSONObject retrieveJsonObj() {
		JSONObject obj = null;
		try {
			obj = new JSONObject(retrieveData());
		} catch (JSONException e) {
			e.printStackTrace();
		}
		return obj;
	}

	@Override
	protected JSONObject doInBackground(Message... params) {
		Message m = params[0];
		if (m.getType().equals(Utils.GET_TAG)) {
			getData(m.getUrl());
		}
		if (m.getType().equals(Utils.POST_TAG)) {
			postData(m.getEntity(), m.getUrl());
		}

		JSONObject obj = retrieveJsonObj();
		Log.d(Utils.RESPONSE_TAG, obj.toString());
		return obj;
	}
}
