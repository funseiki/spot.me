package com.spotme;

import android.app.Fragment;
import android.content.Intent;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.View.OnClickListener;
import android.view.ViewGroup;
import android.widget.Button;

public class MainControlFragment extends Fragment {
	@Override
	public View onCreateView(LayoutInflater inflater, ViewGroup container,
			Bundle savedInstanceState) {
		// Inflate the layout for this fragment
		View result = inflater.inflate(R.layout.main_control, container, false);
		Button createSpot = (Button) result.findViewById(R.id.addSpot);
		createSpot.setOnClickListener(new OnClickListener() {

			@Override
			public void onClick(View v) {
				Intent i = new Intent(getActivity(), NewSpot.class);
				startActivity(i);
			}
		});

		Button profile = (Button) result.findViewById(R.id.profile);
		profile.setOnClickListener(new View.OnClickListener() {

			@Override
			public void onClick(View v) {
				Intent i = new Intent(getActivity(), Profile.class);
				startActivity(i);
			}
		});

		Button main = (Button) result.findViewById(R.id.main);
		main.setOnClickListener(new OnClickListener() {

			@Override
			public void onClick(View v) {
				Intent main = new Intent(getActivity(), Main.class);
				startActivity(main);
			}
		});
		return result;
	}
}
