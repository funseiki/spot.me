package com.spotme;

import java.util.ArrayList;
import java.util.List;

import org.apache.http.HttpEntity;
import org.apache.http.NameValuePair;
import org.apache.http.message.BasicNameValuePair;
import org.json.JSONException;
import org.json.JSONObject;

import android.app.Dialog;
import android.app.ListFragment;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.ListView;
import android.widget.TextView;
import android.widget.Toast;

public class ClueListFragment extends ListFragment {

	@Override
	public void onActivityCreated(Bundle savedInstanceState) {
		super.onActivityCreated(savedInstanceState);
		// Message m = new Message(Utils.GET_TAG,
		// Utils.mainClueListGetRequest,null);
		// some demo data
		JSONObject[] objects = new JSONObject[2];

		JSONObject one = new JSONObject();
		try {
			one.put("clue", "hello world");
			one.put("imgSrc",
					"http://icons.iconarchive.com/icons/deleket/sleek-xp-software/256/Yahoo-Messenger-icon.png");
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

		ClueAdapter adapter = new ClueAdapter(getActivity(),
				R.layout.row_layout, objects);
		setListAdapter(adapter);
	}

	@Override
	public void onListItemClick(ListView l, View v, int position, long id) {
		final TextView tv = (TextView) v.findViewById(R.id.spotId);
		Toast.makeText(getActivity(), tv.getText(), Toast.LENGTH_LONG).show();
		TextView clue = (TextView) v.findViewById(R.id.clue);
		final Dialog dialog = new Dialog(getActivity());
		dialog.setContentView(R.layout.popup);
		dialog.setTitle(R.string.unlockConfirm);
		TextView locationName = (TextView) dialog
				.findViewById(R.id.locationName);
		locationName.setText(clue.getText());
		Button verify = (Button) dialog.findViewById(R.id.verify);
		verify.setOnClickListener(new View.OnClickListener() {

			@Override
			public void onClick(View v) {
				GPSTracker gps = new GPSTracker(getActivity());
				gps.startUsingGPS();
				double longitutde = gps.getLongitude();
				double latitude = gps.getLatitude();
				gps.stopUsingGPS();

				Log.i("GEOLOCATION_VERIFICATION", latitude + ", " + longitutde);

				SpotMeSession session = SpotMeSession.getSession();
				List<NameValuePair> pairs = new ArrayList<NameValuePair>(2);
				pairs.add(new BasicNameValuePair("spotid", tv.getText()
						.toString()));
				pairs.add(new BasicNameValuePair("userid", session.getUserId()));
				pairs.add(new BasicNameValuePair("latitude", String
						.valueOf(latitude)));
				pairs.add(new BasicNameValuePair("longitude", String
						.valueOf(longitutde)));
				// compose entity
				HttpEntity entity = Utils.convertToEntity(pairs);
				Message m = new Message(Utils.POST_TAG, Utils.serverURL
						+ "spot/verify/", entity);
				JSONObject response = Utils.executeRequest(m);
				Toast.makeText(getActivity(), response.toString(),
						Toast.LENGTH_LONG).show();
			}
		});
		Button cancel = (Button) dialog.findViewById(R.id.cancel);
		cancel.setOnClickListener(new View.OnClickListener() {

			@Override
			public void onClick(View v) {
				dialog.dismiss();
			}
		});
		dialog.show();

	}

}
