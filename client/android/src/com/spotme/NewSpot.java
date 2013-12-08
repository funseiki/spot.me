package com.spotme;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;

import org.apache.http.HttpEntity;
import org.apache.http.entity.ContentType;
import org.apache.http.entity.mime.HttpMultipartMode;
import org.apache.http.entity.mime.MultipartEntityBuilder;

import android.app.Activity;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.Bitmap.CompressFormat;
import android.os.Bundle;
import android.provider.MediaStore;
import android.util.Log;
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

	public File convertBitmapToFile(Bitmap bm) {
		File f = new File(getApplicationContext().getCacheDir(), "tmpFile.png");
		try {
			f.createNewFile();
		} catch (IOException e) {
			Log.i("NEW SPOT", "Fail to create file");
			e.printStackTrace();
		}

		// Convert bitmap to byte array
		ByteArrayOutputStream bos = new ByteArrayOutputStream();
		bm.compress(CompressFormat.PNG, 0 /* ignored for PNG */, bos);
		byte[] bitmapdata = bos.toByteArray();
		FileOutputStream fos;
		try {
			fos = new FileOutputStream(f);
			fos.write(bitmapdata);
			fos.flush();
			bos.flush();
			fos.close();
			bos.close();
		} catch (FileNotFoundException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
		return f;
	}

	public void gatherInfoAndSendRequest() {

		EditText hint = (EditText) findViewById(R.id.hint);
		String hintText = hint.getText().toString();

		// EditText spot = (EditText)findViewById(R.id.spot);
		// String spotText = spot.getText().toString();

		MultipartEntityBuilder en = MultipartEntityBuilder.create();
		en.setMode(HttpMultipartMode.BROWSER_COMPATIBLE);
		en.addTextBody("user", session.getUserId());
		en.addTextBody("clue", hintText);
		en.addTextBody("latitude", Double.toString(Utils.LATITUDE_DEFAULT));
		en.addTextBody("longitude", Double.toString(Utils.LONGITUDE_DEFAULT));

		File imgFile = convertBitmapToFile(getPic());

		en.addBinaryBody("file", imgFile, ContentType.create("image/png"),
				"hello.png");

		final HttpEntity entity = en.build();
		Message m = new Message(Utils.POST_TAG,
				Utils.serverURL + "spot/create", entity);

		Utils.executeRequest(m);
		imgFile.delete();
		Toast.makeText(getApplicationContext(), "Send succeeded",
				Toast.LENGTH_LONG).show();
		shutdown();

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
