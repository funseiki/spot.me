package com.spotme;

import java.util.ArrayList;
import java.util.List;

import org.apache.http.HttpEntity;
import org.apache.http.NameValuePair;
import org.apache.http.message.BasicNameValuePair;
import org.json.JSONObject;

import android.app.Activity;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;

public class Register extends Activity {
	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.register);
		submitSetup();
	}

	private void shutdown() {
		this.finish();
	}

	public void submitSetup() {
		Button submit = (Button) findViewById(R.id.btn_signup);
		submit.setOnClickListener(new View.OnClickListener() {

			@Override
			public void onClick(View v) {
				EditText email = (EditText) findViewById(R.id.email);
				EditText pwd = (EditText) findViewById(R.id.password);
				EditText confirmPwd = (EditText) findViewById(R.id.confirmPassword);
				EditText username = (EditText) findViewById(R.id.username);
				String e = email.getText().toString();
				String p = pwd.getText().toString();
				String cp = confirmPwd.getText().toString();
				String un = username.getText().toString();

				GPSTracker gps = new GPSTracker(getApplicationContext());
				gps.startUsingGPS();
				double longitude = gps.getLongitude();
				double latitude = gps.getLatitude();
				gps.stopUsingGPS();

				if (p.equals(cp)) {
					List<NameValuePair> pairs = new ArrayList<NameValuePair>(5);
					pairs.add(new BasicNameValuePair("email", e));
					pairs.add(new BasicNameValuePair("password", p));
					pairs.add(new BasicNameValuePair("name", un));
					pairs.add(new BasicNameValuePair("longitude", String
							.valueOf(longitude)));
					pairs.add(new BasicNameValuePair("latitude", String
							.valueOf(latitude)));
					HttpEntity entity = Utils.convertToEntity(pairs);
					Message m = new Message(Utils.POST_TAG, Utils.serverURL
							+ "user/register/email", entity);

					JSONObject obj = Utils.executeRequest(m);
					String success = Utils.getDataFromJsonObj(obj, "success");
					if (success.equals("true")) {
						Toast.makeText(getApplicationContext(),
								"Success!. Please check your email.",
								Toast.LENGTH_SHORT).show();
						shutdown();
					}
					else{
						Toast.makeText(getApplicationContext(),
								"Something bad happened :( Please try again",
								Toast.LENGTH_SHORT).show();
					}
				}

			}
		});
	}
}
