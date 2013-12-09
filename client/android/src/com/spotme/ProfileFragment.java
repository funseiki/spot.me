package com.spotme;

import android.app.Activity;
import android.app.Fragment;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.AdapterView;
import android.widget.AdapterView.OnItemClickListener;
import android.widget.GridView;
import android.widget.TextView;
import android.widget.Toast;

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
		grid.setAdapter(new ClueAdapter(getActivity(), R.layout.single_pic,
				Utils.getClueListSampleData()));

		grid.setOnItemClickListener(new OnItemClickListener() {

			@Override
			public void onItemClick(AdapterView<?> arg0, View v, int arg2,
					long arg3) {
				TextView tv = (TextView)v.findViewById(R.id.clue);
				Toast.makeText(getActivity(), tv.getText(), Toast.LENGTH_LONG).show();
			}
		});
		return result;
	}

	@Override
	public void onAttach(Activity activity) {
		super.onAttach(activity);
	}
}
