package com.spotme;

import java.util.ArrayList;
import java.util.List;

import org.apache.http.HttpEntity;
import org.apache.http.NameValuePair;
import org.apache.http.message.BasicNameValuePair;
import org.json.JSONObject;

import android.app.Activity;
import android.app.Fragment;
import android.content.Intent;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.AdapterView;
import android.widget.AdapterView.OnItemClickListener;
import android.widget.GridView;
import android.widget.TextView;

public class ProfileFragment extends Fragment {
	@Override
	public View onCreateView(LayoutInflater inflater, ViewGroup container,
			Bundle savedInstanceState) {
		// Inflate the layout for this fragment
		View result = inflater.inflate(R.layout.profile_fragment, container,
				false);
		GridView grid = (GridView) result.findViewById(R.id.pics);
		// send a request to the server and get the response in json object
		// format
		// for now, just use the sample object in the Utils class.
		SpotMeSession session = SpotMeSession.getSession();
		List<NameValuePair> pairs = new ArrayList<NameValuePair>(1);
		pairs.add(new BasicNameValuePair("userid", session.getUserId()));
		HttpEntity entity = Utils.convertToEntity(pairs);
		Message m = new Message(Utils.POST_TAG, Utils.serverURL
				+ "user/profile/", entity);
		JSONObject obj = Utils.executeRequest(m);
		final JSONObject[] data = Utils.getJSONArrayFromJsonObj(obj, "results");

		TextView unlockNum = (TextView) result.findViewById(R.id.unlock_num);
		unlockNum.setText(data.length + "");

		String nickname = Utils.getDataFromJsonObj(obj, "nickname");
		TextView nameView = (TextView) result.findViewById(R.id.username);
		nameView.setText(nickname);

		grid.setAdapter(new ClueAdapter(getActivity(), R.layout.single_pic,
				data));

		grid.setOnItemClickListener(new OnItemClickListener() {

			@Override
			public void onItemClick(AdapterView<?> av, View v, int pos,
					long arg3) {
				TextView tv = (TextView) v.findViewById(R.id.spotId);
				String imgURL = Utils.getDataFromJsonObj(data[pos], "picture");
				Intent i = new Intent(getActivity(), VerifyCorrect.class);
				i.putExtra("spotId", tv.getText().toString());
				i.putExtra("imgURL", imgURL);
				startActivity(i);
			}
		});
		return result;
	}

	@Override
	public void onAttach(Activity activity) {
		super.onAttach(activity);
	}
}
