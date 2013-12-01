package com.spotme;

import org.json.JSONException;
import org.json.JSONObject;

import android.app.ListFragment;
import android.os.Bundle;

public class ClueListFragment extends ListFragment {
	@Override
	public void onActivityCreated(Bundle savedInstanceState) {
		super.onActivityCreated(savedInstanceState);

		// some demo data
		JSONObject[] objects = new JSONObject[2];

		JSONObject one = new JSONObject();
		try {
			one.put("clue", "hello world");
			one.put("imgSrc",
					"http://icons.iconarchive.com/icons/deleket/sleek-xp-software/256/Yahoo-Messenger-icon.png");
			one.put("spotId", "123");
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

}
