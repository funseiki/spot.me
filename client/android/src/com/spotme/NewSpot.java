package com.spotme;

import android.app.Activity;
import android.content.Intent;
import android.graphics.Bitmap;
import android.os.Bundle;
import android.provider.MediaStore;
import android.view.View;
import android.view.View.OnClickListener;
import android.widget.Button;

public class NewSpot extends Activity {
	
	private Bitmap pic;
	
	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.new_spot);
		setupCameraButton();
	}

	private void setupCameraButton() {
		Button cam = (Button) findViewById(R.id.camera);
		cam.setOnClickListener(new OnClickListener() {

			@Override
			public void onClick(View v) {
				dispatchTakePictureIntent(0);
			}
		});
	}

	private void dispatchTakePictureIntent(int actionCode) {
		Intent takePictureIntent = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
		startActivityForResult(takePictureIntent, actionCode);
		handleSmallCameraPhoto(takePictureIntent);
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
}
