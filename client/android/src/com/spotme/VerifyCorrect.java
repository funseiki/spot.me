package com.spotme;

import java.io.File;
import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutionException;

import org.apache.http.NameValuePair;
import org.apache.http.entity.ContentType;
import org.apache.http.entity.mime.HttpMultipartMode;
import org.apache.http.entity.mime.MultipartEntityBuilder;
import org.apache.http.message.BasicNameValuePair;
import org.json.JSONObject;

import android.annotation.TargetApi;
import android.app.Activity;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.os.AsyncTask;
import android.os.Build;
import android.os.Bundle;
import android.provider.MediaStore;
import android.view.View;
import android.view.View.OnClickListener;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.ListView;

public class VerifyCorrect extends Activity {
	private Bitmap commentPic;

	private void setupCameraButton() {
		ImageView cam = (ImageView) findViewById(R.id.camera);
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
	}

	private void handleSmallCameraPhoto(Intent intent) {
		Bundle extras = intent.getExtras();
		commentPic = (Bitmap) extras.get("data");
	}

	@Override
	protected void onActivityResult(int requestCode, int resultCode, Intent data) {
		handleSmallCameraPhoto(data);
		ImageView imgView = (ImageView) findViewById(R.id.camera);
		imgView.setImageBitmap(commentPic);
	}

	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.verify_correct);
		String spotid = getIntent().getExtras().getString("spotId");

		List<NameValuePair> pairs = new ArrayList<NameValuePair>(1);
		pairs.add(new BasicNameValuePair("spotId", spotid));

		// HttpEntity entity = Utils.convertToEntity(pairs);
		// Message m = new Message(Utils.POST_TAG, Utils.serverURL + "",
		// entity);
		// JSONObject response = Utils.executeRequest(m);
		JSONObject[] response = Utils.getCommentSampleData();
		CommentAdapter adapter = new CommentAdapter(getApplicationContext(),
				R.layout.comment_row, response);
		ListView lv = (ListView) findViewById(R.id.commentList);
		lv.setAdapter(adapter);
		setupCameraButton();
		setupCancelButton();
		setupSendCommentButton();
		String samplePicUrl = "https://s3.amazonaws.com/spotme/spots/1fd9bc7606f730b506b29ac4e1a609fc7894c3a7a1e6f893928734fd4b12cf31951fd8ac913cfedbcc66f926c40e53ab.png";
		try {
			new DownloadImg().execute(samplePicUrl).get();
		} catch (InterruptedException e) {
			e.printStackTrace();
		} catch (ExecutionException e) {
			e.printStackTrace();
		}

	}

	private void setupSendCommentButton() {
		Button b = (Button) findViewById(R.id.send);
		b.setOnClickListener(new OnClickListener() {

			@Override
			public void onClick(View v) {
				SpotMeSession session = SpotMeSession.getSession();
				String userid = session.getUserId();
				EditText comment = (EditText) findViewById(R.id.comment);
				String text = comment.getText().toString();
				MultipartEntityBuilder builder = MultipartEntityBuilder
						.create();
				builder.setMode(HttpMultipartMode.BROWSER_COMPATIBLE);
				builder.addTextBody("comment", text);
				builder.addTextBody("userid", userid);

				File imgbody = Utils.convertBitmapToFile(
						getApplicationContext(), commentPic);
				builder.addBinaryBody("file", imgbody,
						ContentType.create("image/png"), "hi.png");
				// final HttpEntity entity = builder.build();
				// create message and send request
			}
		});
	}

	private void setupCancelButton() {
		Button b = (Button) findViewById(R.id.back);
		b.setOnClickListener(new OnClickListener() {

			@Override
			public void onClick(View v) {
				shutdown();
			}
		});
	}

	private void shutdown() {
		this.finish();
	}

	private class DownloadImg extends AsyncTask<String, Void, Bitmap> {

		@Override
		protected Bitmap doInBackground(String... params) {
			Bitmap result = null;
			String url = params[0];
			try {
				URL imageURL = new URL(url);
				result = BitmapFactory.decodeStream(imageURL.openStream());

			} catch (MalformedURLException e) {
				e.printStackTrace();
			} catch (IOException e) {
				e.printStackTrace();
			}
			return result;
		}

		@TargetApi(Build.VERSION_CODES.HONEYCOMB_MR1)
		@Override
		protected void onPostExecute(Bitmap result) {

			final ImageView checkMarkView = (ImageView) findViewById(R.id.checkMark);
			checkMarkView.setImageBitmap(result);
			/*
			 * checkMarkView.animate().alpha(0f).setDuration(2000)
			 * .setListener(new AnimatorListenerAdapter() {
			 * 
			 * @Override public void onAnimationEnd(Animator animation) {
			 * checkMarkView.setVisibility(View.GONE); } }); ImageView
			 * spotPicView = (ImageView) findViewById(R.id.spotPic);
			 * spotPicView.setImageBitmap(result);
			 * 
			 * spotPicView.setAlpha(0f);
			 * spotPicView.setVisibility(View.VISIBLE);
			 * spotPicView.animate().alpha
			 * (1f).setDuration(2000).setListener(null);
			 */
		}
	}
}