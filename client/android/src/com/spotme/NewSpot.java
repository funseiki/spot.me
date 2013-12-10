package com.spotme;

import java.io.File;

import org.apache.http.HttpEntity;
import org.apache.http.entity.ContentType;
import org.apache.http.entity.mime.HttpMultipartMode;
import org.apache.http.entity.mime.MultipartEntityBuilder;
import org.json.JSONObject;

import android.app.Activity;
import android.content.Intent;
import android.graphics.Bitmap;
import android.os.Bundle;
import android.provider.MediaStore;
import android.view.View;
import android.view.View.OnClickListener;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.Toast;

public class NewSpot extends Activity {

	private Bitmap pic;
	private GPSTracker gps;
	private SpotMeSession session;

	private void shutdown() {
		this.finish();
	}

	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.new_spot);
		gps = new GPSTracker(getApplicationContext());
		setupCameraButton();
		setupSubmitButton();
		setupBackButton();
		session = SpotMeSession.getSession();
	}

	private void setupBackButton() {
		Button back = (Button) findViewById(R.id.back);
		back.setOnClickListener(new OnClickListener() {

			@Override
			public void onClick(View v) {
				shutdown();
			}
		});
	}

	private void setupSubmitButton() {

		Button send = (Button) findViewById(R.id.send);
		send.setOnClickListener(new OnClickListener() {

			@Override
			public void onClick(View v) {
				gatherInfoAndSendRequest();
			}
		});
	}

	public void gatherInfoAndSendRequest() {

		EditText hint = (EditText) findViewById(R.id.hint);
		String hintText = hint.getText().toString();

		EditText spot = (EditText) findViewById(R.id.spot);
		String spotText = spot.getText().toString();

		MultipartEntityBuilder en = MultipartEntityBuilder.create();
		en.setMode(HttpMultipartMode.BROWSER_COMPATIBLE);
		en.addTextBody("userid", session.getUserId());
		en.addTextBody("clue", hintText);
		en.addTextBody("latitude", Double.toString(gps.getLatitude()));
		en.addTextBody("longitude", Double.toString(gps.getLongitude()));
		en.addTextBody("story", spotText);

		File imgFile = Utils.convertBitmapToFile(getApplicationContext(),
				getPic());

		en.addBinaryBody("file", imgFile, ContentType.create("image/png"),
				"hello.png");

		final HttpEntity entity = en.build();
		Message m = new Message(Utils.POST_TAG, Utils.serverURL
				+ "spot/create/", entity);

		JSONObject obj = Utils.executeRequest(m);
		imgFile.delete();
		if (Utils.getDataFromJsonObj(obj, "success").equals("true")) {
			Toast.makeText(getApplicationContext(), "Send succeeded",
					Toast.LENGTH_LONG).show();
			shutdown();
		} else {
			Toast.makeText(getApplicationContext(), "Send failed. Please retry.",
					Toast.LENGTH_LONG).show();
		}
	}

	private void setupCameraButton() {
		Button cam = (Button) findViewById(R.id.camera);
		cam.setOnClickListener(new OnClickListener() {

			@Override
			public void onClick(View v) {
				dispatchTakePictureIntent(0);
				gps.startUsingGPS();
			}
		});
	}

	private void dispatchTakePictureIntent(int actionCode) {
		Intent takePictureIntent = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
		startActivityForResult(takePictureIntent, actionCode);
	}

	private void handleSmallCameraPhoto(Intent intent) {
		Bundle extras = intent.getExtras();
		Bitmap mImageBitmap = (Bitmap) extras.get("data");
		setPic(mImageBitmap);
	}

	public Bitmap getPic() {
		return pic;
	}

	public void setPic(Bitmap pic) {
		this.pic = pic;
	}

	@Override
	protected void onActivityResult(int requestCode, int resultCode, Intent data) {
		handleSmallCameraPhoto(data);
		ImageView imgView = (ImageView) findViewById(R.id.picPreview);
		imgView.setImageBitmap(getPic());
		String loc = gps.getLatitude() + ", " + gps.getLongitude();
		Toast.makeText(getApplicationContext(), (CharSequence) loc,
				Toast.LENGTH_LONG).show();
		gps.stopUsingGPS();
	}

	public GPSTracker getGps() {
		return gps;
	}

	public void setGps(GPSTracker gps) {
		this.gps = gps;
	}
}
