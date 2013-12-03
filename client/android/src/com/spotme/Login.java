package com.spotme;

import java.util.List;

import org.apache.http.NameValuePair;
import org.apache.http.message.BasicNameValuePair;

import android.os.Bundle;
import android.app.Activity;
import android.content.Intent;
import android.view.Menu;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;

public class Login extends Activity {

	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.login);
		loginButtonSetup();
		signupButtonSetup();
	}

	public void signupButtonSetup() {
		Button signup = (Button) findViewById(R.id.btn_signup);
		signup.setOnClickListener(new View.OnClickListener() {

			@Override
			public void onClick(View v) {
				Intent i = new Intent(getApplicationContext(), Register.class);
				startActivity(i);
			}
		});
	}

	public void loginButtonSetup() {
		Button login = (Button) findViewById(R.id.btn_login);
		login.setOnClickListener(new View.OnClickListener() {

			@Override
			public void onClick(View v) {
				EditText email = (EditText) findViewById(R.id.email);
				EditText pwd = (EditText) findViewById(R.id.password);

				Message m = new Message(ServerConnection.POST_TAG,
						ServerConnection.serverURL + "login/", 2);
				List<NameValuePair> pairs = m.getNameValuePairs();
				pairs.add(new BasicNameValuePair("email", email.getText()
						.toString()));
				pairs.add(new BasicNameValuePair("password", pwd.getText()
						.toString()));

				String str = Utils.sendRequest(m);
				Toast.makeText(getApplicationContext(), (CharSequence) str,
						Toast.LENGTH_SHORT).show();
			}
		});
	}

	@Override
	public boolean onCreateOptionsMenu(Menu menu) {
		// Inflate the menu; this adds items to the action bar if it is present.
		getMenuInflater().inflate(R.menu.login, menu);
		return true;
	}

}
