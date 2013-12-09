package com.spotme;

import java.io.IOException;
import java.net.URL;

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

	private final Context context;
	private final JSONObject[] objs;
	private final int resource;

	public ClueAdapter(Context context, int resource, JSONObject[] objects) {
		super(context, resource, objects);
		this.context = context;
		this.objs = objects;
		this.resource = resource;
	}

	private static class ViewHolder {
		private ImageView imageView;
		private Bitmap bitmap;
		private String imageURL;

		public ViewHolder(ImageView iv, Bitmap bm, String url) {
			this.imageView = iv;
			this.bitmap = bm;
			this.imageURL = url;
		}
	}

	@Override
	public View getView(int position, View convertView, ViewGroup parent) {

		LayoutInflater inflater = (LayoutInflater) context
				.getSystemService(Context.LAYOUT_INFLATER_SERVICE);

		JSONObject obj = objs[position];

		String imgSrc = Utils.getDataFromJsonObj(obj, "imgSrc");
		String clue = Utils.getDataFromJsonObj(obj, "clue");
		String spotId = Utils.getDataFromJsonObj(obj, "spotId");

		ViewHolder viewHolder = null;
		if (convertView == null) {
			convertView = inflater.inflate(getResource(), null);
			ImageView imgView = (ImageView) convertView.findViewById(R.id.img);

			viewHolder = new ViewHolder(imgView, null, imgSrc);
			viewHolder.imageView = (ImageView) convertView
					.findViewById(R.id.img);
			convertView.setTag(viewHolder);
		}
		TextView clueView = (TextView) convertView.findViewById(R.id.clue);
		TextView spotIdView = (TextView) convertView.findViewById(R.id.spotId);
		clueView.setText(clue);
		spotIdView.setText(spotId);

		viewHolder = (ViewHolder) convertView.getTag();

		new DownloadAsyncTask().execute(viewHolder);

		return convertView;
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

	private class DownloadAsyncTask extends
			AsyncTask<ViewHolder, Void, ViewHolder> {

		@Override
		protected ViewHolder doInBackground(ViewHolder... params) {
			ViewHolder viewHolder = params[0];
			try {
				URL imageURL = new URL(viewHolder.imageURL);
				viewHolder.bitmap = BitmapFactory.decodeStream(imageURL
						.openStream());
			} catch (IOException e) {
				Log.e("error", "Downloading Image Failed");
				viewHolder.bitmap = null;
			}

			return viewHolder;
		}

		@Override
		protected void onPostExecute(ViewHolder result) {
			Log.d(Utils.CLUE_ADAPTER_TAG, "Downloaded reach here "
					+ result.imageURL);
			if (result.bitmap == null) {
				result.imageView.setImageResource(R.drawable.ic_launcher);
			} else {
				result.imageView.setImageBitmap(result.bitmap);
			}
		}
	}
}
