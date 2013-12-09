package com.spotme;

import android.app.Activity;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;

public class VerifyIncorrect extends Activity {

	private void shutdown() {
		this.finish();
	}

	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.verify_incorrect);
		TextView tv = (TextView) findViewById(R.id.miles);
		String distance = getIntent().getExtras().getString("distance");
		tv.setText(distance+" ");

		Button back = (Button) findViewById(R.id.cancel);
		back.setOnClickListener(new View.OnClickListener() {

			@Override
			public void onClick(View v) {
				shutdown();
			}
		});
	}

}
