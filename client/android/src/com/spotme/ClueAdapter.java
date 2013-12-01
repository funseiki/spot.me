package com.spotme;

import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.concurrent.ExecutionException;

import org.json.JSONException;
import org.json.JSONObject;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.os.AsyncTask;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.ImageView;
import android.widget.TextView;

public class ClueAdapter extends ArrayAdapter<JSONObject> {

	private static final String TAG = "ClueAdapter";

	private final Context context;
	private final JSONObject[] objs;
	private final int resource;

	public ClueAdapter(Context context, int resource, JSONObject[] objects) {
		super(context, resource, objects);
		this.context = context;
		this.objs = objects;
		this.resource = resource;
	}

	private String getDataFromJsonObj(JSONObject obj, String name) {
		String result = null;
		try {
			result = obj.getString(name);
		} catch (JSONException e) {
			e.printStackTrace();
			Log.i(TAG, name + " does not exist in JSON object.");
		}
		return result;
	}

	@Override
	public View getView(int position, View convertView, ViewGroup parent) {
		LayoutInflater inflater = (LayoutInflater) context
				.getSystemService(Context.LAYOUT_INFLATER_SERVICE);
		View rowView = inflater.inflate(R.layout.row_layout, parent, false);
		TextView clueView = (TextView) rowView.findViewById(R.id.clue);
		TextView spotIdView = (TextView) rowView.findViewById(R.id.spotId);
		ImageView imgView = (ImageView) rowView.findViewById(R.id.img);
		JSONObject obj = objs[position];

		String clue = getDataFromJsonObj(obj, "clue");
		String spotId = getDataFromJsonObj(obj, "spotId");
		String imgSrc = getDataFromJsonObj(obj, "imgSrc");

		clueView.setText(clue);
		spotIdView.setText(spotId);

		LoadImageAsyncTask load = new LoadImageAsyncTask();
		Bitmap bm = null;
		try {
			bm = load.execute(imgSrc).get();
		} catch (InterruptedException e) {
			Log.i(TAG, "async task interrupted");
			e.printStackTrace();
		} catch (ExecutionException e) {
			Log.i(TAG, "async task execution failed");
			e.printStackTrace();
		}
		imgView.setImageBitmap(bm);

		return rowView;
	}

	public Context getContext() {
		return context;
	}

	public JSONObject[] getObjs() {
		return objs;
	}

	public int getResource() {
		return resource;
	}

	private class LoadImageAsyncTask extends AsyncTask<String, Void, Bitmap> {

		@Override
		protected Bitmap doInBackground(String... params) {
			String url = params[0];
			URL imgURL = null;
			Bitmap bm = null;
			try {
				imgURL = new URL(url);
			} catch (MalformedURLException e) {
				e.printStackTrace();
				Log.i(TAG, "invalid URL");
			}
			try {
				bm = BitmapFactory.decodeStream(imgURL.openStream());
			} catch (IOException e) {
				Log.i(TAG, "error downloading");
				e.printStackTrace();
			}
			return bm;
		}
	}

}
