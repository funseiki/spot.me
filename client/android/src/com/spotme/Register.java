package com.spotme;

import java.util.List;

import org.apache.http.NameValuePair;
import org.apache.http.message.BasicNameValuePair;

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
				if (p.equals(cp)) {
					Message m = new Message(ServerConnection.POST_TAG,
							ServerConnection.serverURL + "user/register/email",
							3);
					List<NameValuePair> pairs = m.getNameValuePairs();
					pairs.add(new BasicNameValuePair("email", e));
					pairs.add(new BasicNameValuePair("password", p));
					pairs.add(new BasicNameValuePair("name", un));
					String str = Utils.sendRequest(m);
					Toast.makeText(getApplicationContext(), (CharSequence) str,
							Toast.LENGTH_SHORT).show();
				}
				
			}
		});
	}
}
