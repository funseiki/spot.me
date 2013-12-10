package com.spotme;

import java.util.ArrayList;
import java.util.List;

import org.apache.http.HttpEntity;
import org.apache.http.NameValuePair;
import org.apache.http.message.BasicNameValuePair;
import org.json.JSONObject;

import android.app.Dialog;
import android.app.ListFragment;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.ListView;
import android.widget.TextView;

public class ClueListFragment extends ListFragment {

	@Override
	public void onActivityCreated(Bundle savedInstanceState) {
		super.onActivityCreated(savedInstanceState);

		SpotMeSession session = SpotMeSession.getSession();
		List<NameValuePair> pairs = new ArrayList<NameValuePair>(1);
		pairs.add(new BasicNameValuePair("userid", session.getUserId()));
		HttpEntity en = Utils.convertToEntity(pairs);
		Message m = new Message(Utils.POST_TAG, Utils.serverURL+"list/current/", en);
		JSONObject reponse = Utils.executeRequest(m);
		Log.d(Utils.CLUE_ADAPTER_TAG, reponse.toString());
		JSONObject[] objects = Utils.getJSONArrayFromJsonObj(reponse, "results");
		
		ClueAdapter adapter = new ClueAdapter(getActivity(),
				R.layout.row_layout, objects);
		setListAdapter(adapter);
	}

	@Override
	public void onListItemClick(ListView l, View v, int position, long id) {
		final TextView tv = (TextView) v.findViewById(R.id.spotId);
		TextView clue = (TextView) v.findViewById(R.id.clue);

		final Dialog dialog = new Dialog(getActivity());
		dialog.setContentView(R.layout.popup);
		dialog.setTitle("Verification");
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

				// composing request parameter
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
				dialog.dismiss();
				if (Utils.getDataFromJsonObj(response, "success")
						.equals("true")) {
					// bring up the verify correct activity
					Intent i = new Intent(getActivity(), VerifyCorrect.class);
					i.putExtra("spotId", tv.getText().toString());
					i.putExtra("imgURL", Utils.getDataFromJsonObj(response, "picture"));
					startActivity(i);
				} else {
					// bring up the verify incorrect activity
					Intent i = new Intent(getActivity(), VerifyIncorrect.class);
					i.putExtra("distance",
							Utils.getDataFromJsonObj(response, "distance"));
					startActivity(i);
				}
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
