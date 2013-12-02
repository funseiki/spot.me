package com.spotme;

import java.util.ArrayList;
import java.util.List;

import org.apache.http.NameValuePair;

public class Message {
	
	private String type;
	private String url;
	private List<NameValuePair> nameValuePairs;
	private int numOfEntry;

	/**
	 * Message constructor
	 * @param type ServerConnection.GET_TAG or ServerConnection.POST_TAG
	 * @param url  
	 * @param num number of name value pair in the request
	 */
	public Message(String type, String url, int num) {
		setNumOfEntry(num);
		setType(type);
		setUrl(url);
		setNameValuePairs(new ArrayList<NameValuePair>(num));
	}

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	public int getNumOfEntry() {
		return numOfEntry;
	}

	public void setNumOfEntry(int numOfEntry) {
		this.numOfEntry = numOfEntry;
	}

	public String getUrl() {
		return url;
	}

	public void setUrl(String url) {
		this.url = url;
	}

	public List<NameValuePair> getNameValuePairs() {
		return nameValuePairs;
	}

	public void setNameValuePairs(List<NameValuePair> nameValuePairs) {
		this.nameValuePairs = nameValuePairs;
	}
}
